import './module-alias-config';

if (process.env.NODE_ENV !== 'production') {
  require('@dotenvx/dotenvx').config({ path: '.env' });
}

import {
  validateORMConfig,
  validateNotificationsConfig,
  validateExternalServicesConfig,
  validateParserConfig,
  assertConfigValid
} from 'podverse-helpers';
import { createORMContext, getDataSourceRead, getDataSourceReadWrite } from "podverse-orm";
import { createFirebaseContext } from "podverse-external-services";
import { createNotificationsContext } from "podverse-notifications";
import { createParserContext } from "podverse-parser";
import { loggerService } from './factories/loggerService';
import { activeMQArtemisService } from './factories/activeMQArtemisService';
import { testKeyvaldbConnection, keyvaldb } from './lib/keyvaldb/keyvaldb';
import { config } from './config';
import { validateStartupRequirements } from './lib/startup/validation';

let serverInstance: import('http').Server | null = null;

const shutdown = async (signal?: string) => {
  try {
    loggerService.info(`Shutdown initiated${signal ? ` due to ${signal}` : ''}`);
    if (serverInstance) {
      await new Promise<void>((resolve, reject) => {
        serverInstance!.close((err) => (err ? reject(err) : resolve()));
      });
      loggerService.info('HTTP server closed');
    }
    try {
      await activeMQArtemisService.close();
    } catch (err) {
      loggerService.error('Error closing Artemis during shutdown', err as Error);
    }
    try {
      await getDataSourceRead().destroy();
      await getDataSourceReadWrite().destroy();
      loggerService.info('Database connections closed');
    } catch (err) {
      loggerService.error('Error closing DB connections during shutdown', err as Error);
    }
    try {
      // Check if connection is still open before trying to quit
      if (keyvaldb.status === 'ready' || keyvaldb.status === 'connecting') {
        await keyvaldb.quit();
        loggerService.info('KeyValDB connection closed');
      } else {
        loggerService.info('KeyValDB connection already closed');
      }
    } catch (err) {
      loggerService.error('Error closing KeyValDB connection during shutdown', err as Error);
    }
  } catch (err) {
    loggerService.error('Error during shutdown', err as Error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

(async () => {
  try {
    // Validate podverse-api environment variables first
    validateStartupRequirements();

    // Build module configs from app config
    const ormConfig = {
      nodeEnv: config.nodeEnv,
      database: {
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT!, 10),
        read_username: process.env.DB_READ_USERNAME!,
        read_password: process.env.DB_READ_PASSWORD!,
        read_write_username: process.env.DB_READ_WRITE_USERNAME!,
        read_write_password: process.env.DB_READ_WRITE_PASSWORD!,
        database: process.env.DB_DATABASE!,
        ssl_connection: process.env.DB_SSL_CONNECTION === 'true',
      },
      log: {
        level: config.log.level,
        dir: process.env.LOG_DIR,
        timer: process.env.LOG_TIMER === 'true',
      },
      defaults: {
        account: {
          settings: {
            locale: process.env.DEFAULT_ACCOUNT_SETTINGS_LOCALE!,
          }
        }
      }
    };

    const externalServicesConfig = {
      firebase: {
        notifications_enabled: process.env.GOOGLE_FIREBASE_NOTIFICATIONS_ENABLED === "true",
        admin_json_key_path: process.env.GOOGLE_FIREBASE_ADMIN_JSON_KEY_PATH || "",
      },
      web: {
        protocol: config.web.protocol,
        host: config.web.domain,
        icon_image_url: process.env.WEB_ICON_IMAGE_PATH || "",
      }
    };

    const notificationsConfig = {
      brandName: process.env.BRAND_NAME || "",
      web: {
        protocol: config.web.protocol,
        host: config.web.domain,
        icon_image_path: process.env.WEB_ICON_IMAGE_PATH || "",
      },
      webpush: {
        enabled: process.env.WEBPUSH_ENABLED === "true",
        vapid_public_key: process.env.WEBPUSH_VAPID_PUBLIC_KEY || "",
        vapid_private_key: process.env.WEBPUSH_VAPID_PRIVATE_KEY || "",
        vapid_subject: process.env.WEBPUSH_VAPID_SUBJECT || "",
      }
    };

    const parserConfig = {
      userAgent: config.userAgent,
      log: {
        level: config.log.level,
        dir: process.env.LOG_DIR,
        timer: process.env.LOG_TIMER === 'true',
      },
      firebase: {
        notifications_enabled: process.env.GOOGLE_FIREBASE_NOTIFICATIONS_ENABLED === "true",
        authJsonPath: process.env.FIREBASE_PATH_TO_AUTH_JSON,
      },
      podcastIndex: {
        authKey: config.podcastIndex.authKey,
        baseUrl: config.podcastIndex.baseUrl,
        secretKey: config.podcastIndex.secretKey,
        rateLimitDelay: process.env.PODCAST_INDEX_API_RATE_LIMIT_DELAY 
          ? parseInt(process.env.PODCAST_INDEX_API_RATE_LIMIT_DELAY, 10) 
          : undefined
      },
      parser: {
        addRemoteItemsToMQ: process.env.PARSER_ADD_REMOTE_ITEMS_TO_MQ === 'true',
      },
      defaults: {
        account: {
          settings: {
            locale: process.env.DEFAULT_ACCOUNT_SETTINGS_LOCALE!,
          }
        }
      }
    };

    // Validate all module configs
    assertConfigValid(validateORMConfig(ormConfig), 'podverse-orm');
    assertConfigValid(validateExternalServicesConfig(externalServicesConfig), 'podverse-external-services');
    assertConfigValid(validateNotificationsConfig(notificationsConfig), 'podverse-notifications');
    assertConfigValid(validateParserConfig(parserConfig), 'podverse-parser');

    // Create module contexts
    const ormContext = createORMContext(ormConfig);
    const firebaseContext = createFirebaseContext(externalServicesConfig);
    const notificationsContext = createNotificationsContext(notificationsConfig);
    createParserContext({
      config: parserConfig,
      notificationsContext,
      firebaseContext,
    });

    loggerService.info("Connecting to the database");
    await ormContext.dataSourceRead.initialize();
    await ormContext.dataSourceReadWrite.initialize();
    loggerService.info("Connected to the database");

    // Test KeyValDB connection (non-critical, for caching)
    const keyvaldbConnected = await testKeyvaldbConnection();
    if (keyvaldbConnected) {
      loggerService.info("Connected to KeyValDB");
    } else {
      loggerService.warn("Warning: Unable to connect to KeyValDB, caching will be unavailable");
    }

    const { startApp } = await import("./app");
    const maybeServer = await startApp();
    if (maybeServer) serverInstance = maybeServer;
  } catch (error) {
    // For validation errors, log just the message without stack trace
    if (error instanceof Error && error.message.includes('FATAL:')) {
      console.error(error.message);
      process.exit(1);
    } else {
      // Other errors - log with full details
      loggerService.error("Error during application startup", error);
      process.exit(1);
    }
  }
})();

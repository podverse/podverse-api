import "reflect-metadata";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from "express";
import { CategoryService } from "podverse-orm";
import { config } from '@api/config';
import { loggerService } from "@api/factories/loggerService";
import { initializePassport } from '@api/lib/auth';
// Route imports are deferred until after ORM initialization (see startApp function)

export const app = express();
const port = parseInt(config.api.port, 10);

// TODO: is this safe? Needed? The express-rate-limiter wanted it for the error message below:
// ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false (default).
// This could indicate a misconfiguration which would prevent express-rate-limit from accurately identifying users.
// See https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/ for more information.
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.use(cors({
  origin: config.api.allowedCORSOrigins,
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(initializePassport());

const baseUrl = `${config.api.prefix}${config.api.version}`;

export const startApp = async () => {
  try {
    const categoryService = new CategoryService();
    await categoryService.setCategoryCache();

    // Import routes after ORM context is initialized
    const { accountRouter } = await import('@api/routes/account');
    const { authRouter } = await import('@api/routes/auth');
    const { categoryRouter } = await import('@api/routes/category');
    const { channelRouter } = await import('@api/routes/channel');
    const { clipRouter } = await import('@api/routes/clip');
    const { externalServicesRouter } = await import('@api/routes/externalServices');
    const { itemRouter } = await import('@api/routes/item');
    const { itemSoundbiteRouter } = await import('./routes/itemSoundbite');
    const { liveItemRouter } = await import('./routes/liveItem');
    const { mediumRouter } = await import('@api/routes/medium');
    const { membershipClaimTokenRouter } = await import('@api/routes/membershipClaimToken');
    const { membershipRouter } = await import('@api/routes/membership');
    const { accountPayPalOrderRouter } = await import('@api/routes/paypal');
    const { playlistRouter } = await import('@api/routes/playlist');
    const { podrollRouter } = await import("@api/routes/podroll");
    const { queueRouter } = await import('@api/routes/queue');
    const { statsRouter } = await import('@api/routes/stats');
    const { itemTranscriptRouter } = await import('./routes/itemTranscript');
    const { itemChapterRouter } = await import('./routes/itemChapter');
    const { mqRouter } = await import('./routes/mq');
    const { feedRouter } = await import('./routes/feed');
    const { publisherFeedRouter } = await import('./routes/publisherFeed');
    const { accountSettingsRouter } = await import('./routes/accountSettings');
    const { profileContentRouter, myProfileContentRouter } = await import('./routes/profileContent');

    app.get(`${baseUrl}/`, (req: Request, res: Response) => {
      res.send(`The server is running on port ${port}`);
    });

    app.use(accountRouter);
    app.use(accountPayPalOrderRouter);
    app.use(accountSettingsRouter);
    app.use(authRouter);
    app.use(categoryRouter);
    app.use(channelRouter);
    app.use(clipRouter);
    app.use(externalServicesRouter);
    app.use(feedRouter);
    app.use(itemRouter);
    app.use(itemChapterRouter);
    app.use(itemSoundbiteRouter);
    app.use(itemTranscriptRouter);
    app.use(liveItemRouter);
    app.use(mediumRouter);
    app.use(membershipClaimTokenRouter);
    app.use(membershipRouter);
    app.use(mqRouter);
    app.use(playlistRouter);
    app.use(podrollRouter);
    app.use(profileContentRouter);
    app.use(myProfileContentRouter);
    app.use(publisherFeedRouter);
    app.use(queueRouter);
    app.use(statsRouter);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      loggerService.logError('API Router Error', err);
      res.status(500).json({ message: err.message });
    });

    const server = app.listen(port, () => {
      loggerService.info(`The server is running on port ${port}`);
    });

    server.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'EADDRINUSE') {
        loggerService.error(`API port ${port} is already in use. Exiting.`);
      } else {
        loggerService.error('HTTP server failed to start', err);
      }
      process.exit(1);
    });

    return server;
  } catch (error) {
    loggerService.logError('API Top Level Router Error', error as Error);
  }
};

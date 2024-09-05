import './module-alias-config';
require('@dotenvx/dotenvx').config();

console.log('process.env', process.env);

import logger from '@helpers/lib/logs/logger';
import { AppDataSource } from '@orm/db';
import commands from '@workers/commands';
import { parseArgs } from '@workers/commands/parseArgs';

const args = parseArgs();
const commandName = (args._ as string[])[0];

if (!commandName) process.exit(1);

const command = commands[commandName];

const runApp = async () => {
  try {
    logger.info("Connecting to the database");
    await AppDataSource.initialize();
    logger.info("Connected to the database");

    if (command) {
      await command(args);
    } else {
      console.error(`Command "${commandName}" not found.`);
    }
  
  } catch (error) {
    console.error('Error running app:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

runApp();

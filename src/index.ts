import 'module-alias/register';
require('@dotenvx/dotenvx').config();

import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import { config } from '@/config';
import { AppDataSource } from "@/db";
import logger, { logError } from '@/lib/logs/logger';
import channelRoutes from '@/routes/channel';
import mediumValueRoutes from '@/routes/mediumValue';

console.log(`NODE_ENV = ${config.nodeEnv}`);

const app = express();
const port = 1234;

export const startApp = async () => {
  try {
    logger.info("Connecting to the database");
    await AppDataSource.initialize();
    logger.info("Connected to the database");

    app.get("/", (req: Request, res: Response) => {
      res.send(`The server is running on port ${port}`);
    });

    app.use(channelRoutes);
    app.use(mediumValueRoutes);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ error: err.message });
    });

    app.listen(port, () => {
      logger.info(`The server is running on port ${port}`);
    });
  } catch (error) {
    logError(error as Error);
  }
};

startApp();

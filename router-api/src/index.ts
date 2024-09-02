import 'module-alias/register';
require('@dotenvx/dotenvx').config();

import "reflect-metadata";
import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from "express";
import logger, { logError } from '@helpers/lib/logs/logger';
import { AppDataSource } from "@orm/db";
import { parseAllRSSFeeds } from '@parser/lib/parser/rss/parser';
import { config } from '@router-api/config';
import { channelRouter } from '@router-api/routes/channel';
import { feedRouter } from '@router-api/routes/feed';
import { mediumRouter } from '@router-api/routes/medium';

console.log(`NODE_ENV = ${config.nodeEnv}`);

const app = express();
const port = 1234;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const baseUrl = `${config.api.prefix}${config.api.version}`;

export const startApp = async () => {
  try {
    logger.info("Connecting to the database");
    await AppDataSource.initialize();
    logger.info("Connected to the database");

    app.get(`${baseUrl}/`, (req: Request, res: Response) => {
      res.send(`The server is running on port ${port}`);
    });

    app.get(`${baseUrl}/parse-all`, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await parseAllRSSFeeds();
        res.status(200).send(data);
      } catch (err) {
        next(err);
      }
    });

    app.use(channelRouter);
    app.use(feedRouter);
    app.use(mediumRouter);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error(err.stack);
      res.status(500).json({ message: err.message });
    });

    app.listen(port, () => {
      logger.info(`The server is running on port ${port}`);
    });
  } catch (error) {
    logError(error as Error);
  }
};

startApp();

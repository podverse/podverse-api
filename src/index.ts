import './module-alias-config';
require('@dotenvx/dotenvx').config();

import "reflect-metadata";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from "express";
import { logger, logError } from 'podverse-helpers';
import { AppDataSourceRead, AppDataSourceReadWrite, CategoryService } from "podverse-orm";
import { config } from '@api/config';
import { initializePassport } from '@api/lib/auth';
import { accountRouter } from '@api/routes/account';
import { authRouter } from '@api/routes/auth';
import { categoryRouter } from '@api/routes/category';
import { channelRouter } from '@api/routes/channel';
import { clipRouter } from './routes/clip';
import { feedRouter } from '@api/routes/feed';
import { itemRouter } from '@api/routes/item';
import { mediumRouter } from '@api/routes/medium';
import { membershipClaimTokenRouter } from '@api/routes/membershipClaimToken';
import { accountPayPalOrderRouter } from './routes/paypal';
import { playlistRouter } from './routes/playlist';
import { queueRouter } from './routes/queue';

logger.info(`NODE_ENV = ${config.nodeEnv}`);

const app = express();
const port = 1234;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(initializePassport());

const baseUrl = `${config.api.prefix}${config.api.version}`;

export const startApp = async () => {
  try {
    logger.info("Connecting to the database");
    await AppDataSourceRead.initialize();
    await AppDataSourceReadWrite.initialize();
    logger.info("Connected to the database");

    const categoryService = new CategoryService();
    await categoryService.setCategoryCache();

    app.get(`${baseUrl}/`, (req: Request, res: Response) => {
      res.send(`The server is running on port ${port}`);
    });

    app.use(accountRouter);
    app.use(accountPayPalOrderRouter);
    app.use(authRouter);
    app.use(categoryRouter);
    app.use(channelRouter);
    app.use(clipRouter);
    app.use(feedRouter);
    app.use(itemRouter);
    app.use(mediumRouter);
    app.use(membershipClaimTokenRouter);
    app.use(playlistRouter);
    app.use(queueRouter);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logError('API Router Error', err);
      res.status(500).json({ message: err.message });
    });

    app.listen(port, () => {
      logger.info(`The server is running on port ${port}`);
    });
  } catch (error) {
    logError('API Top Level Router Error', error as Error);
  }
};

startApp();

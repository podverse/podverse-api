import "reflect-metadata";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from "express";
import { CategoryService } from "podverse-orm";
import { config } from '@api/config';
import { loggerService } from "@api/factories/loggerService";
import { initializePassport } from '@api/lib/auth';
import { accountRouter } from '@api/routes/account';
import { authRouter } from '@api/routes/auth';
import { categoryRouter } from '@api/routes/category';
import { channelRouter } from '@api/routes/channel';
import { clipRouter } from '@api/routes/clip';
import { feedRouter } from '@api/routes/feed';
import { itemRouter } from '@api/routes/item';
import { itemSoundbiteRouter } from "./routes/itemSoundbite";
import { mediumRouter } from '@api/routes/medium';
import { membershipClaimTokenRouter } from '@api/routes/membershipClaimToken';
import { accountPayPalOrderRouter } from '@api/routes/paypal';
import { playlistRouter } from '@api/routes/playlist';
import { podrollRouter } from "@api/routes/podroll";
import { queueRouter } from '@api/routes/queue';
import { statsRouter } from '@api/routes/stats';

export const app = express();
const port = 1234;

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
    app.use(itemSoundbiteRouter);
    app.use(mediumRouter);
    app.use(membershipClaimTokenRouter);
    app.use(playlistRouter);
    app.use(podrollRouter);
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

    return server;
  } catch (error) {
    loggerService.logError('API Top Level Router Error', error as Error);
  }
};

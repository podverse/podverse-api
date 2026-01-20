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
import { externalServicesRouter } from '@api/routes/externalServices';
import { itemRouter } from '@api/routes/item';
import { itemSoundbiteRouter } from "./routes/itemSoundbite";
import { liveItemRouter } from "./routes/liveItem";
import { mediumRouter } from '@api/routes/medium';
import { membershipClaimTokenRouter } from '@api/routes/membershipClaimToken';
import { membershipRouter } from '@api/routes/membership';
import { accountPayPalOrderRouter } from '@api/routes/paypal';
import { playlistRouter } from '@api/routes/playlist';
import { podrollRouter } from "@api/routes/podroll";
import { queueRouter } from '@api/routes/queue';
import { statsRouter } from '@api/routes/stats';
import { itemTranscriptRouter } from "./routes/itemTranscript";
import { itemChapterRouter } from "./routes/itemChapter";
import { mqRouter } from "./routes/mq";
import { feedRouter } from "./routes/feed";
import { publisherFeedRouter } from "./routes/publisherFeed";
import { accountSettingsRouter } from "./routes/accountSettings";
import { profileContentRouter, myProfileContentRouter } from "./routes/profileContent";

export const app = express();
const port = 1234;

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

    return server;
  } catch (error) {
    loggerService.logError('API Top Level Router Error', error as Error);
  }
};

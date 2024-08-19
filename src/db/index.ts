import { DataSource } from "typeorm";
import { config } from "@/config";
import { Category } from "@/entities/category";
import { Feed } from "@/entities/feed/feed";
import { FeedFlagStatus } from "@/entities/feed/feedFlagStatus";
import { FeedLog } from "@/entities/feed/feedLog";
import { MediumValue } from "@/entities/mediumValue";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false,
  logging: false,
  entities: [
    Category,
    Feed,
    FeedFlagStatus,
    FeedLog,
    MediumValue
  ],
  migrations: [],
  subscribers: [],
});

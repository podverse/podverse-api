import { DataSource } from "typeorm";
import { config } from "@/config";
import { User } from "@/entities/user";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});

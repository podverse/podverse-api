import { DataSource } from "typeorm";
import { User } from "../entities/user";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "user",
  password: "mysecretpw",
  database: "db",
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});

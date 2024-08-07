import "reflect-metadata";
import express, { Request, Response } from "express";
import { AppDataSource } from "./db";

const app = express();
const port = 3000;

AppDataSource.initialize().then(() => {
  console.log("Connected to the database")

  app.get("/", (req: Request, res: Response) => {
      res.send(`The server is running on port ${port}`);
  });

  app.listen(port, () => {
    console.log(`The server is running on port ${port}`);
  });
}).catch(error => console.log(error));

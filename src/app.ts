import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Controller } from "./main.controller";
import mongoose from "mongoose";
import { MONGO_URL } from "../src/constants/userApi.constants";
class App {
  public app: any;
  public userController: Controller;
  options = {
    autoIndex: false, // Don't build indexes
    reconnectTries: 30, // Retry up to 30 times
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    useNewUrlParser: true
  };
  count = 0;

  constructor() {
    this.app = express();
    this._setConfig();
    this._setMongoConfig();

    this.userController = new Controller(this.app);
  }

  private _setConfig() {
    this.app.use(bodyParser.json({ limit: "50mb" }));
    this.app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
    this.app.use(cors());
  }

  private _setMongoConfig() {
    mongoose.Promise = global.Promise;

    mongoose
      .connect(MONGO_URL, this.options)
      .then(() => {
        console.log("MongoDB is connected");
      })
      .catch(err => {
        console.log(
          "MongoDB connection unsuccessful, retry after 5 seconds. " + err,
          ++this.count
        );
        setTimeout(this._setMongoConfig, 5000);
      });
  }
}

export default new App().app;

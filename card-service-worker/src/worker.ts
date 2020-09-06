import * as path from 'path';

import { config } from 'dotenv';
const ENV_FILE = path.join(__dirname, '..', '.env');
config({ path: ENV_FILE });

const redis = require("redis");

const subscriber = redis.createClient(6380, process.env.REDISCACHEHOSTNAME, {auth_pass: process.env.REDISCACHEKEY, tls: {servername: process.env.REDISCACHEHOSTNAME}});
const redisCli = redis.createClient(6380, process.env.REDISCACHEHOSTNAME, {auth_pass: process.env.REDISCACHEKEY, tls: {servername: process.env.REDISCACHEHOSTNAME}});
import { EchoService } from './services/echoService';
import { BaseService } from "./services/baseService";
import { CardService } from "./services/cardService";
import { FlowService } from "./services/flowService";
import { CustomizedDialog, Session, DialogState } from './models/session'

import { RedisUtil } from './utils/redisUtil'

const connectionString = process.env["EVENTHUB_CONNECTION_STRING"] || "";
const eventHubName = process.env["EVENTHUB_NAME"] || "";
const consumerGroup = process.env["CONSUMER_GROUP_NAME"] || "";

export class Worker {

  public static async listen() {
    subscriber.on("subscribe", function (channel, count) {
      console.log('🚀 Worker subscribed to inbound broker')
    });

    subscriber.on("message", async (channel, message: string) => {
      console.log("Subscriber received message in channel: " + channel + " value: " + message);
      const dialog: CustomizedDialog = await RedisUtil.get(message);
      const srv = this.getServiceType(dialog.userSession);
      await srv.process(dialog.userSession);
      RedisUtil.set(message, dialog, 60 * 60);
      this.sendToOutbound(message);
    });
    subscriber.subscribe("inbound");

  }

  public static sendToOutbound(message: string) {
    redisCli.publish('outbound', message);
  }

  public static getServiceType(session: Session): BaseService {
    if (session.state === DialogState.NO_STATE) { // no state conversation
      switch (session.input.value) {
        case '1': {
          return new CardService();
        }
        case '2': {
          return new FlowService();
        }
        default: {
          return new EchoService();
        }
      }
    } else {
      switch (session.service) { // already in a dialog flow
        case 'CardService': {
          return new CardService();
        }
        case 'FlowService': {
          return new FlowService();
        }
        default: {
          return new EchoService();
        }
      }
    }
  }
}

DemoWorker.listen();


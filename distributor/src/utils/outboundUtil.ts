import { BotFrameworkAdapter, Activity, Attachment, CardFactory, MessageFactory } from 'botbuilder';
import { CustomizedDialog, MessageType } from '../models/session'

const redis = require("redis");
const redisCli = redis.createClient(6380, process.env.REDISCACHEHOSTNAME, { auth_pass: process.env.REDISCACHEKEY, tls: { servername: process.env.REDISCACHEHOSTNAME } });
import * as fs from 'fs';
import * as path from 'path';

import { EventHubConsumerClient, earliestEventPosition, latestEventPosition } from "@azure/event-hubs";
import { RedisUtil } from './redisUtil';

const connectionString = process.env["EVENTHUB_CONNECTION_STRING"] || "";
const consumerGroup = process.env["CONSUMER_GROUP_NAME"] || "";

const consumerClient = new EventHubConsumerClient(consumerGroup, connectionString, "outbound");

export class OutboundUtil {

    public static async listen(adapter: BotFrameworkAdapter) {
        console.log('🚗 Subscribed to outbound broker')

        const subscription = consumerClient.subscribe(
            {
                // The callback where you add your code to process incoming events
                processEvents: async (events, context) => {
                    // Note: It is possible for `events` to be an empty array.
                    // This can happen if there were no new events to receive
                    // in the `maxWaitTimeInSeconds`, which is defaulted to
                    // 60 seconds.
                    // The `maxWaitTimeInSeconds` can be changed by setting
                    // it in the `options` passed to `subscribe()`.
                    for (const event of events) {
                        console.log(
                            `dialogId: '${event.partitionKey}' and consumer group: '${context.consumerGroup}'`
                        );
                        const dialogId = event.partitionKey;
                        const dialog: CustomizedDialog = event.body;
                        
                        await adapter.continueConversation(dialog.conRef, async turnContext => {
                            if (dialog.userSession.output.type === MessageType.card) {
                                const cardFile = JSON.parse(
                                    fs.readFileSync(path.join(__dirname, "../cards/" + dialog.userSession.output.value + ".json"))
                                        .toString()
                                );
                                const card: Attachment = CardFactory.adaptiveCard(cardFile);
                                const message: Partial<Activity> = MessageFactory.attachment(card);
                                await turnContext.sendActivity(message);
                            } else if (dialog.userSession.output.type === MessageType.text) {
                                await turnContext.sendActivity(dialog.userSession.output.value);
                            } else {
                                console.error('Can not identify message type');
                            }
                        });
                    }
                },
                processError: async (err, context) => {
                    console.log(`Error : ${err}`);
                }
            },
            { startPosition: latestEventPosition }
        );
    }

}
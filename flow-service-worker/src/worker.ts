import * as path from 'path';

import { config } from 'dotenv';
const ENV_FILE = path.join(__dirname, '..', '.env');
config({ path: ENV_FILE });

import { FlowService } from "./services/flowService";
import { CustomizedDialog } from './models/session'
import { EventHubUtil } from './utils/eventHubUtil'
import { RedisUtil } from './utils/redisUtil'

import { EventHubConsumerClient, earliestEventPosition, latestEventPosition } from "@azure/event-hubs";

const connectionString = process.env["EVENTHUB_CONNECTION_STRING"] || "";
const eventHubName = process.env["EVENTHUB_NAME"] || "";
const consumerGroup = process.env["CONSUMER_GROUP_NAME"] || "";

const consumerClient = new EventHubConsumerClient(consumerGroup, connectionString, eventHubName);

export class Worker {

    public static async listen() {
        console.log('🚀 Worker subscribed to inbound broker')

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
                        new FlowService().process(dialog.userSession);
                        RedisUtil.set(dialogId, dialog, 60 * 60);
                        EventHubUtil.send('outbound', dialogId, dialog);
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

Worker.listen();


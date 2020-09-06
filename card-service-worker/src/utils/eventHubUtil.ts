import { EventHubProducerClient } from "@azure/event-hubs";

const connectionString = process.env["EVENTHUB_CONNECTION_STRING"] || "";
const producers = {}

export class EventHubUtil {

    public static async send(eventHubName: string, messageKey: string, message: any): Promise<void> {
        if (!producers[eventHubName]) {
            producers[eventHubName] = new EventHubProducerClient(connectionString, eventHubName);
        }
        const batchOptions = {
            partitionKey: messageKey
        }
        let batch = await producers[eventHubName].createBatch(batchOptions);
        let wasAdded = batch.tryAdd({ body: message });
        if (wasAdded) {
            await producers[eventHubName].sendBatch(batch);
        } else {
            throw new Error("Error sending eventHub");
        }
        
    }

}

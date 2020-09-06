import { ActivityHandler } from 'botbuilder';
import { InboundUtil } from '../utils/inboundUtil'

export class InboundBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await InboundUtil.handleNewInputActivity(context);
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            await InboundUtil.handleNewMemberActivity(context)
            await next();
        });
    }
}

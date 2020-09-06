import { Activity, MessageFactory, TurnContext } from 'botbuilder';
import { RedisUtil } from './redisUtil'
import { EventHubUtil } from './eventHubUtil'
import { SessionUtil } from './sessionUtil';
import { CustomizedDialog, DialogState } from '../models/session'

export class InboundUtil {

    public static async handleNewInputActivity(context: TurnContext) {
        const stopDialog = this.terminateDialog(context.activity);
        if (stopDialog) {
            return await context.sendActivity('Your user session is reset, pls start from beginning');
        } else {
            const { dialogId, dialog } = await this.setupCustomizedDialog(context);
            this.sendToWorker(dialogId, dialog);
        }
    }

    public static async handleNewMemberActivity(context: TurnContext) {
        const membersAdded = context.activity.membersAdded;
        const welcomeText = 'Hello and welcome!';
        const optionText = `Type below options to go through the demo:\n\n
        1: User Feedback Demo (AdaptiveCard)\n
        2: User Register Demo (Dialog flow)\n
        Others: Echo Message Demo
        `;
        for (const member of membersAdded) {
            if (member.id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                await context.sendActivity(MessageFactory.text(optionText, optionText));
            }
        }

    }

    private static async setupCustomizedDialog(context: TurnContext): Promise<any> {
        const dialogId = RedisUtil.getDialogKey(context.activity.recipient.id);
        const conversationReference = TurnContext.getConversationReference(context.activity);
        const dialog: CustomizedDialog = {
            conRef: conversationReference,
            userSession: null
        }
        const dialogInRedis: CustomizedDialog = await RedisUtil.get(dialogId);
        if (dialogInRedis) {
            // update dialog
            console.log('found dialog');
            dialog.userSession = SessionUtil.updateSession(context.activity, dialogInRedis.userSession)
            
        } else { // new dialog
            console.log('new dialog');
            dialog.userSession = SessionUtil.newSession(context.activity)
            
        }
        return { dialogId, dialog };
    }

    private static sendToWorker(dialogId: string, dialog: CustomizedDialog) {
        const session = dialog.userSession;
        if (session.state === DialogState.NO_STATE) { // no state conversation
            switch (session.input.value) {
                case '1': {
                    EventHubUtil.send('cardservice', dialogId, dialog);
                    break;
                }
                case '2': {
                    EventHubUtil.send('flowservice', dialogId, dialog);
                    break;
                }
                default: {
                    EventHubUtil.send('echoservice', dialogId, dialog);
                }
            }
        } else {
            switch (session.service) { // already in a dialog flow
                case 'CardService': {
                    EventHubUtil.send('cardservice', dialogId, dialog);
                    break;
                }
                case 'FlowService': {
                    EventHubUtil.send('flowservice', dialogId, dialog);
                    break;
                }
                default: {
                    EventHubUtil.send('echoservice', dialogId, dialog);
                }
            }
        }
    }

    private static terminateDialog(activity: Activity): boolean {
        const stop_words = ['quit'];
        if (activity.text && (stop_words.indexOf(activity.text) > -1)) {
            RedisUtil.delete(RedisUtil.getDialogKey(activity.recipient.id));
            return true;
        } else {
            return false;
        }

    }
}
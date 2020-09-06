import { Event, InitiatorType, Session, MessageType, DialogState } from '../models/session'
import { Activity } from 'botbuilder';
export class SessionUtil {

    public static addHistory(session: Session, initiatorType: InitiatorType, messageType: MessageType, value: string) {
        const event: Event = {
            initiator: initiatorType,
            type: messageType,
            value: value,
            timestamp: new Date()
        }
        session.eventHistory.push(event);
    }


    public static newSession(activity: Activity): Session {
        const session: Session = {
            id: activity.recipient.id,
            state: DialogState.NO_STATE,
            step: 0,
            input: { type: MessageType.text, value: activity.text },
            output: {
                type: MessageType.text,
                value: ''
            },
            flow: null,
            eventHistory: []
        };
        this.addHistory(session, InitiatorType.user, MessageType.text, activity.text);
        return session;
    }

    public static updateSession(activity: Activity, session: Session): Session {
        if (typeof(activity.text) === 'string') {
            session.input.type = MessageType.text;
            session.input.value = activity.text;
        } else {
            session.input.type = MessageType.card;
            session.input.value = activity.value;
        }

        this.addHistory(session, InitiatorType.user, MessageType.text, activity.text);
        return session;
    }
}


import { ConversationReference } from "botbuilder";

export interface CustomizedDialog {
    conRef: Partial<ConversationReference>;
    userSession: Session;
}


export interface Session {
    id: string;
    state?: DialogState;
    service?: string;
    email?: string;
    username?: string;
    step?: number,
    input: {
        type: MessageType
        value: string | any
    };
    output: {
        type: MessageType
        value: string
    };
    flow?: any;
    eventHistory?: Event[];
}

export interface Event {
    initiator: InitiatorType; // bot or user
    type: MessageType; // card or plantext
    value: string | any; // card name or user input
    timestamp: Date
}

export enum MessageType {
    card,
    text
}


export enum InitiatorType {
    bot,
    user
}

export enum DialogState {
    NO_STATE,
    IN_DIALOG,
}

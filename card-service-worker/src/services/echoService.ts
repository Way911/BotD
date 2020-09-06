import {  DialogState, InitiatorType, Session, MessageType } from '../models/session'
import { BaseService } from './baseService'

export class EchoService extends BaseService{
    public async process(session: Session): Promise<void> {
        session.state = DialogState.NO_STATE;
        session.service = "EchoService";
        session.output.type = MessageType.text;
        session.output.value = `Echo: ${session.input.value}`;
        super.addHistory(session, InitiatorType.bot, session.output.type, session.output.value)
    }

}
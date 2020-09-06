import { InitiatorType, Session, MessageType } from '../models/session'
import {SessionUtil} from '../utils/sessionUtil'

export abstract class BaseService {

    public addHistory(session: Session, initiatorType: InitiatorType, messageType: MessageType, value: string) {
       return SessionUtil.addHistory(session, initiatorType, messageType, value);
    }


    public abstract async process(session : Session) : Promise<void> ;

}
import { DialogState, InitiatorType, Session, MessageType } from '../models/session'
import { BaseService } from './baseService'

export class CardService extends BaseService {
    public async process(session: Session): Promise<void> {
        if (session.state === DialogState.NO_STATE && session.step === 0) {
            this.step1(session);
        } else {
            this.step2(session);
        }
    }

    step1(session: Session) { // send card to ask feedback
        session.state = DialogState.IN_DIALOG;
        session.service = "CardService";
        session.step = session.step + 1;
        session.output.type = MessageType.card;
        session.output.value = 'feedbackCard';
        super.addHistory(session, InitiatorType.bot, session.output.type, session.output.value)
    }

    step2(session: Session) { // confirm recieving feedback and close dialog
        session.state = DialogState.NO_STATE;
        session.service = "";
        session.step = 0;
        console.log(session.input.value);// handle the feedback
        session.output.type = MessageType.text;
        session.output.value = 'We have recieved your message: \n\n'
            + session.input.value.feedback
            + '\n\nThanks for your feedback! See you next time.';
        super.addHistory(session, InitiatorType.bot, session.output.type, session.output.value)
    }

}
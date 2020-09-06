import { DialogState, InitiatorType, Session, MessageType } from '../models/session'
import { BaseService } from './baseService'

export class FlowService extends BaseService{


    public async process(session: Session): Promise<void> {
        if (session.state === DialogState.NO_STATE && session.step === 0) {
            this.step1(session);
        } else if (session.state === DialogState.IN_DIALOG && session.step === 1) {
            this.step2(session);
        } else if (session.state === DialogState.IN_DIALOG && session.step === 2) {
            this.step3(session);
        } else if (session.state === DialogState.IN_DIALOG && session.step === 3) {
            this.step4(session);
        }
    }

    step1(session: Session) { // send welcome message and ask 1st question
        session.state = DialogState.IN_DIALOG;
        session.service = "FlowService";
        session.step = session.step + 1;
        console.log('start register flow');
        session.output.type = MessageType.text;
        session.output.value = 'Welcome to use employee register flow\n\n' + "What's your name ?";
        super.addHistory(session, InitiatorType.bot, session.output.type, session.output.value)
    }

    step2(session: Session) { // confirm recieving feedback and close dialog
        session.step = session.step + 1;
        session.output.type = MessageType.text;
        console.log('name:', session.input.value);
        session.output.value = "What's your email ?";
        super.addHistory(session, InitiatorType.bot, session.output.type, session.output.value)
    }

    step3(session: Session){
        session.step = session.step + 1;
        session.output.type = MessageType.text;
        console.log('email:', session.input.value);
        session.output.value = "How old are you ?";
        super.addHistory(session, InitiatorType.bot, session.output.type, session.output.value)
    }

    step4(session: Session){
        session.state = DialogState.NO_STATE;
        session.step = 0;
        session.output.type = MessageType.text;
        console.log('age:', session.input.value);
        session.output.value = "You have registered successfully, thanks for using out bot, see you next time";
        super.addHistory(session, InitiatorType.bot, session.output.type, session.output.value)
    }

}
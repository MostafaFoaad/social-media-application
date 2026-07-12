import type { IAuthSocket } from "../../../common/types/express.types.js";
import {Server} from 'socket.io';
import { ChatEvent, chatEvent } from "./chat.events.js";

export class ChatGateWay{
    private chatEvent:ChatEvent
    constructor(){
        this.chatEvent=chatEvent
    }

    registerEvents=(socket:IAuthSocket,io:Server)=>{
        this.chatEvent.sayHi(socket)
    }
}

export const chatGateWay=new ChatGateWay();
import type { IAuthSocket } from "../../../common/types/express.types.js";

export class ChatEvent{
    constructor(){

    }

    sayHi=(socket:IAuthSocket)=>{
        return socket.on("sayHi",(data)=>{
            try{
                console.log({data})
                socket.emit("sayHi","lol")
            }

            catch(error){
                socket.emit("custom_error",error)
            }
            
        })
    }
}


export const chatEvent=new ChatEvent();
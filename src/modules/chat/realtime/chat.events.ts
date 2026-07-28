import type { IAuthSocket } from "../../../common/types/express.types.js";
import {Server} from 'socket.io';
import  { chatService,ChatService } from "../chat.service.js";
import  { redisService,RedisService } from "../../../common/services/redis.service.js";

export class ChatEvent{
    private chatService:ChatService
    private redisService:RedisService
    constructor(){
        this.redisService=redisService
        this.chatService=chatService
    }

    sayHi=(socket:IAuthSocket)=>{
        return socket.on("sayHi",(data)=>{
            try{
                socket.emit("sayHi","lol")
            }

            catch(error){
                socket.emit("custom_error",error)
            }
            
        })
    }


    sendMessage=(socket:IAuthSocket,io:Server)=>{
        return socket.on("sendMessage",async({content,sendTo}:{content:string,sendTo:string})=>{
            try{ 
            await this.chatService.sendMessage({content,sendTo},socket.data.user)
            io.to(await this.redisService.getSockets(socket.data.user._id)).emit("successMessage",{content,sendTo})
            const recievedSocketsIds=await this.redisService.getSockets(sendTo)

            if(recievedSocketsIds.length){
                socket.to(recievedSocketsIds).emit("newMessage",{content,from:socket.data.user})
            }
        }
        catch(error){
            console.log({error})
            socket.emit("custom_error",error)
        }
        })
    }

    sendGroupMessage=(socket:IAuthSocket,io:Server)=>{
        return socket.on("sendGroupMessage",async({content,groupId}:{content:string,groupId:string})=>{
            try{ 
            const roomId=await this.chatService.sendGroupMessage({content,groupId},socket.data.user)
            io.to(await this.redisService.getSockets(socket.data.user._id)).emit("successMessage",{content,sendTo:groupId})
            

            
                socket.to(roomId).emit("newMessage",{content,groupId})
             
        }
        catch(error){
            console.log({error})
            socket.emit("custom_error",error)
        }
        })
    }


    join_room=(socket:IAuthSocket,io:Server)=>{
        return socket.on("join_room",async({roomId}:{roomId:string})=>{
            try{
                socket.join(roomId)
            }
            catch(error){
                console.log({error})
                socket.emit("custom_error",error)
            }
        })
    }



}


export const chatEvent=new ChatEvent();
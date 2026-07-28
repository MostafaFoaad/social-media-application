import { Server } from "socket.io";
import { TokenService } from "../../common/services/token.service.js";
import  { redisService,RedisService } from "../../common/services/redis.service.js";
import type { IAuthSocket/* , IAuthUser */ } from "../../common/types/express.types.js";
import {Server as HttpServerType} from "node:http";
import { chatGateWay } from "../chat/index.js";

export class RealTimeGateway{
    private io!:Server;
    private tokenService:TokenService;
    private redisService:RedisService;

    constructor(){
        this.tokenService=new TokenService()
        this.redisService= redisService
    }


    authentication= async(socket:IAuthSocket,next:any)=>{
        try{
            const {user,decoded}= await this.tokenService.decodeToken({token:socket.handshake.headers.authorization || socket.handshake.auth.authorization  })

            socket.data={user,decoded}
            await this.redisService.addSocket(user._id, socket.id)
            next()
        }
        catch(error){
            next(error)
        }
    }


    initializeIo=(httpServer:HttpServerType)=>{
            this.io=new Server(httpServer,{
                cors:{origin:"*"}
            })
        
            this.io.use(this.authentication)
        
            this.io.on("connection",async(socket:IAuthSocket)=>{
                
               
                chatGateWay.registerEvents(socket,this.io)
        
                socket.on("disconnect",async()=>{
                    await this.redisService.removeSocket(socket.data.user._id,socket.id);
                    const connections=await this.redisService.getSockets(socket.data.user._id) ||[];
        
                    if(connections.length<1){
                        console.log("offline-user")
                        this.io.emit("offline_user", {userId:socket.data.user._id})
                    }
                })
            })
    }

    getIo(){
        return this.io
    }
}


export const realTimeGateway=new RealTimeGateway()
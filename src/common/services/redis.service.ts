import { createClient, type RedisClientType } from "redis";
import { REDIS_URI } from "../../config/config.js";
import { EmailEnum } from "../enums/index.js";
import type { Types } from "mongoose";
type RedisKeyType={email:string,subject?:EmailEnum}
export class RedisService{
    private readonly client:RedisClientType;

    constructor(){
        this.client=createClient({url:REDIS_URI});
        this.handleEvents();
    }

    private handleEvents(){
        this.client.on("error",(error)=>{console.log("REDIS ERROR")});
        this.client.on("ready",()=>{console.log("REDIS IS READY")});
    }

    public async connect(){
        await this.client.connect();
        console.log("REDIS DATABASE CONNECTED SUCCESSFULLY");
    }

    
    
      baseRevokeTokenKey=(userId:Types.ObjectId|string):string=>{
        return `RevokeToken::${userId.toString()}`
    }
    
    
      revokeTokenKey=({userId,jti}:{userId:Types.ObjectId|string,jti:string}):string=>{
        return `RevokeToken::${userId}::${jti}`
    }
    
    
      otpKey=({email,subject=EmailEnum.Confirm_Email}:RedisKeyType):string=>{
        return `OTP::User::${email}::${subject}`
    }
    
      maxAttemptOtpKey=({email,subject=EmailEnum.Confirm_Email}:RedisKeyType):string=>{
        return `${this.otpKey({email,subject})}::MaxTrial`
    }
    
      blockOtpKey=({email,subject=EmailEnum.Confirm_Email}:RedisKeyType):string=>{
        return `${this.otpKey({email,subject})}::Block`
    }
    
    
      set = async ({key, value, ttl}:{
        key:string,
        value:any,
        ttl?:number|undefined
      }):Promise<string|null> => {
        try {
         /*    if (!this.client.isOpen) {
            await this.client.connect();
        } */
            const data =
                typeof value === "string" ? value : JSON.stringify(value);

            return ttl?await this.client.set(key,data,{EX:ttl}):await this.client.set(key, data);
        } catch (error) {
            console.error("Redis SET error:", error);
            return null;
        }
    }
    
    
     /*  get = async (key:string):Promise<any> => {
        try {
            const data = await this.client.get(key);
            if (!data) return null;
    
            try {
                return JSON.parse(data as string);
            } catch {
                return data;
            }
        } catch (error) {
            console.error("Redis GET error:", error);
            return null;
        }
    } */

        get = async (key: string): Promise<any> => {
    try {
        /* if (!this.client.isOpen) {
            await this.client.connect();
        } */
        const data = await this.client.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data as string);
        } catch {
            return data;
        }
    } catch (error) {
        console.error("Redis GET error:", error);
        return null;
    }
}
    
    
      update = async ({key, value, ttl}:{
        key:string,
        value:string|object,
        ttl?:number|undefined
      }):Promise<string|number|null> => {
        try {
            const exists = await this.client.exists(key);
            if (!exists) return 0;
            return await this.set({key, value, ttl});
        } catch (error) {
            console.error("Redis UPDATE error:", error);
            return 0;
        }
    }
    
      mGet=async(keys:string[]) : Promise<string[] | number | null>=>{
        try {
            if(!keys.length) return 0;
              return await this.client.mGet(keys) as string[];
        } catch (error) {
              console.error("AN ERROR HAS BEEN OCCURED");
              return []
        }
    }
    
      keys=async(prefix:string):Promise<string[]>=>{
        try{
            return await this.client.keys(`${prefix}*`)
        }
        catch(error){
            console.log("AN ERROR HAS BEEN OCCURED")
            return []
        }
    }
    
      deleteKey = async (key:string|string[]):Promise<number> => {
        try {
            if(!key.length) return 0;
            return await this.client.del(key);

        } catch (error) {
            console.log("Redis DELETE error:", error);
            return 0;
        }
    }
    
    
      expire = async ({key, ttl}:{key:string,ttl:number}):Promise<number> => {
        try {
            return await this.client.expire(key, ttl);
        } catch (error) {
            console.error("Redis EXPIRE error:", error);
            return 0;
        }
    }
    
    
      ttl = async (key:string):Promise<number> => {
        try {
            return await this.client.ttl(key);
        } catch (error) {
            console.error("Redis TTL error:", error);
            return -2;
        }
    }

     exists = async (key:string):Promise<number> => {
        try {
            return await this.client.exists(key);
        } catch (error) {
            console.error("Redis EXISTS error:", error);
            return -2;
        }
    }
    
      incr=async(key:string):Promise<number>=>{
        try{
            return await this.client.incr(key)
        }
        catch(error){
            console.log('FAIL IN REDIS INCREMENT OPERATION')
            return -2
        }
    }
    
    
     /*  allKeysByPrefix = async (baseKey) => {
        return await redisClient.keys(baseKey);
    } */


        FCM_key(userId:Types.ObjectId|string) {
            return `user:FCM:${userId.toString()}`;
            }
        async addFCM(userId:Types.ObjectId|string, FCMToken:string) {
            return await this.client.sAdd(this.FCM_key(userId), FCMToken);
            }

         async  removeFCM(userId:Types.ObjectId|string, FCMToken:string) {
             return await this.client.sRem(this.FCM_key(userId), FCMToken);
            }

        async  getFCMs(userId:Types.ObjectId|string) {
            return await this.client.sMembers(this.FCM_key(userId));
            }

         async  hasFCMs(userId:Types.ObjectId|string) {
            return await this.client.sCard(this.FCM_key(userId));
            }

        async  removeFCMUser(userId:Types.ObjectId|string) {
             return await this.client.del(this.FCM_key(userId));
            }

}

export const redisService=new RedisService();
import {type Request,type Response, type NextFunction } from "express";
import { TokenTypeEnum } from "../common/enums/token.enum.js";
import { TokenService } from "../common/services/token.service.js";
import { UnauthorizedException } from "../common/exceptions/domain.exception.js";

export const authentication=(tokenType:TokenTypeEnum=TokenTypeEnum.ACCESS)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        const tokenService=new TokenService();
        const [schema,credentials]=req.headers.authorization?.split(" ")||[];
        if(!schema||!credentials){
            throw new UnauthorizedException('INVALID APPROACH');
        }
        switch(schema){
            case 'Bearer':
               const{decoded,user}= await tokenService.decodeToken({token:credentials,tokenType});
               req.user=user;
               req.decoded=decoded
                break;
            default:
                throw new UnauthorizedException('MISSING AUTHENTICATION SCHEMA');
                break;
        }
        
        next();
    }
}


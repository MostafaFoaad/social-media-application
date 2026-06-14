import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, SYSTEM_ACCESS_TOKEN_SECRET_KEY, SYSTEM_REFRESH_TOKEN_SECRET_KEY, USER_ACCESS_TOKEN_SECRET_KEY, USER_REFRESH_TOKEN_SECRET_KEY } from "../../config/config.js";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { RoleEnum } from "../enums/user.enum.js";
import { TokenTypeEnum } from "../enums/token.enum.js";
import { BadException, NotFoundException, UnauthorizedException } from "../exceptions/domain.exception.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { RedisService } from "./redis.service.js";
import type { HydratedDocument, Types } from "mongoose";
import type { IUser } from "../interfaces/user.interface.js";
import { randomUUID } from "node:crypto";
type SignaturesType={accessSignatutre:string,refreshSignature:string}
export class TokenService{
    private readonly userRepository:UserRepository;
    private readonly redisService:RedisService;

    constructor(){
        this.userRepository=new UserRepository();
        this.redisService=new RedisService();
    }
    sign=async({
        payload,
        secret=USER_ACCESS_TOKEN_SECRET_KEY,
        options
    }:{
        payload:object,
        secret?:string,
        options?:SignOptions
    }):Promise<string>=>{
        return jwt.sign(payload,secret,options)
    }

    verify=async({
        token,
        secret=USER_ACCESS_TOKEN_SECRET_KEY,
        options
    }:{
        token:string,
        secret?:string,
        options?:SignOptions
    }):Promise<JwtPayload>=>{
        return jwt.verify(token,secret)as JwtPayload
    }

    detectSignaturesLevel=async(level:RoleEnum):Promise<SignaturesType>=>{
        let signatures:SignaturesType;
        switch(level){
            case RoleEnum.ADMIN:
            signatures={accessSignatutre:SYSTEM_ACCESS_TOKEN_SECRET_KEY,refreshSignature:SYSTEM_REFRESH_TOKEN_SECRET_KEY};
            break;
            default:
            signatures={accessSignatutre:USER_ACCESS_TOKEN_SECRET_KEY,refreshSignature:USER_REFRESH_TOKEN_SECRET_KEY}
            break;
                    }
        return signatures;
    }
    
    getTokenSignature=async(tokenType=TokenTypeEnum.ACCESS,signatureLevel:RoleEnum):Promise<string>=>{
    const signatures=await this.detectSignaturesLevel(signatureLevel)
    let signature;
switch(tokenType){ 
    case TokenTypeEnum.REFRESH:
        signature=signatures.refreshSignature
        break;
    default:
        signature=signatures.accessSignatutre
        break;
    }
    return signature;
    }
    decodeToken=async({token,tokenType=TokenTypeEnum.ACCESS}:{token:string,tokenType:TokenTypeEnum}):Promise<{
        user:HydratedDocument<IUser>,
        decoded:JwtPayload
    }>=>{
    const decoded=jwt.decode(token) as JwtPayload;
    if(!decoded?.aud?.length){
        throw new BadException('MISSING TOKEN AUDIENCE');
    }
    const [tokenApproach,level]=decoded.aud;
    console.log({tokenApproach,level})
    if(tokenApproach==undefined||level==undefined){
        throw new BadException('MISSING TOKEN AUDIENCE');
    }
    if(tokenType!=tokenApproach as unknown as TokenTypeEnum){
        throw new BadException(`INVALID TOKEN APPROACH ONLY ${tokenType} ALLOWED FOR THIS ENDPOINT `);
    }


        if(decoded.jti&&await this.redisService.get(this.redisService.revokeTokenKey({userId:decoded.sub as string,jti:decoded.jti}))){
        throw new UnauthorizedException('INVALID LOGIN SESSION')
    }

    const secret=await this.getTokenSignature(tokenApproach as unknown as TokenTypeEnum,level as unknown as RoleEnum)
    const verifiedData=await this.verify({token,secret})

    const user=await this.userRepository.findOne({filter:{_id:verifiedData.sub}})
    console.log({decoded,verifiedData})
    if (!user) {
        throw new NotFoundException('USER CANNOT BE FOUND');
    }
    if(user.changeCredentialsTime&&user.changeCredentialsTime?.getTime()>=(decoded.iat as number||0)*1000){
        throw new UnauthorizedException('INVALID LOGIN SESSION');
    }
    return {user,decoded}
    }
    createLoginCredentials=async(user:HydratedDocument<IUser>,issuer:string):Promise<{access_token:string,refresh_token:string}>=>{
    const {accessSignatutre,refreshSignature}=await this. detectSignaturesLevel(user.role)
    const jwtid=randomUUID()
       const access_token=await this.sign({ 
            payload:{sub:user._id,extra:250},
            secret:accessSignatutre,
            options:{
                issuer,
                audience:[TokenTypeEnum.ACCESS as unknown as string,user.role as unknown as string],
                expiresIn:ACCESS_TOKEN_EXPIRES_IN,
                jwtid
            }
        }
    )
    const refresh_token=await this.sign({ 
            payload:{sub:user._id,extra:250},
            secret:refreshSignature,
            options:{
                issuer,
                audience:[TokenTypeEnum.REFRESH as unknown as string,user.role as unknown as string],
                expiresIn:REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            }
        }
    )

    return{access_token,refresh_token};
    }
    createRevokeToken=async({userId,jti,ttl}:{userId:Types.ObjectId|string,jti:string,ttl:number})=>{
    await this.redisService.set({
            key:this.redisService.revokeTokenKey({userId,jti}),
            value:jti,
            ttl
           })
           return;
}
}
import type { HydratedDocument } from "mongoose";
import type { IUser } from "../../common/interfaces/user.interface.js";
import { redisService, RedisService } from "../../common/services/redis.service.js";
import { TokenService } from "../../common/services/token.service.js";
import { LogoutEnum } from "../../common/enums/token.enum.js";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../config/config.js";
import { ConflictException, NotFoundException } from "../../common/exceptions/domain.exception.js";
import { s3Service, type S3Service } from "../../common/services/s3.service.js";
import { StorageApproachEnum, UploadApproachEnum } from "../../common/enums/multer.enum.js";
import { UserRepository } from "../../DB/repository/user.repository.js";

export class UserService{
        private readonly redis:RedisService;
        private readonly tokenService:TokenService
        private readonly userRepository:UserRepository
        private readonly s3:S3Service
    constructor(){
        this.redis=redisService;
        this.tokenService=new TokenService();
        this.userRepository=new UserRepository();
        this.s3=s3Service

    }
    async profileCoverImages(files:Express.Multer.File[],user:HydratedDocument<IUser>){
        const oldUrls=user.profileCoverPictures;
        const urls=await this.s3.uploadAssets({
            files,
            path:`Users/${user._id.toString()}/Profile/Cover`,
            storageApproach:StorageApproachEnum.DISK,
            uploadApproach:UploadApproachEnum.SMALL,
        })
        user.profileCoverPictures=urls;
        await user.save()
        if(oldUrls?.length){
            await this.s3.deleteAssets({
                Keys:oldUrls.map(ele=>{return{Key:ele}})
            })
        }
        return user.toJSON()
    }

    /* async profileImage(file:Express.Multer.File,user:HydratedDocument<IUser>){
        const {Key}=await this.s3.uploadLargeAsset({
            file,
            path:`Users/${user._id.toString()}/Profile`,
            storageApproach:StorageApproachEnum.DISK
        })
        user.profilePicture=Key as string;
        await user.save()
        return user.toJSON()
    } */

        async profileImage({ ContentType,originalName}:{ContentType:string,originalName:string},user:HydratedDocument<IUser>):Promise<{user:IUser,url:string}>{
        const oldPic=user.profilePicture;    
        const {url,Key}=await this.s3.createPreSignedUploadLink({
            path:`Users/${user._id.toString()}/Profile`,
            ContentType,
            originalName
        })
        user.profilePicture=Key as string;
        await user.save();
        if(oldPic){
            await this.s3.deleteAsset({Key:oldPic})
        }
        return {user,url}
    }

    async profile(user:HydratedDocument<IUser>):Promise<any>{
        return user.toJSON()
        /* const data=await this.userRepository.findOne({options:{populate:[{path: "friends"}]}}) as HydratedDocument<IUser>
        return data .toJSON() */
    }

    async logout({flag}:{flag:LogoutEnum},user:HydratedDocument<IUser>,{jti,iat,sub}:{jti:string,iat:number,sub:string}):Promise<number>{
    let status=200
    switch(flag){
        case LogoutEnum.ALL:
            user.changeCredentialsTime=new Date()
            await user.save();
            await this.redis.deleteKey(await this.redis.keys(this.redis.baseRevokeTokenKey(sub)))
            break;
        default:
           await this.tokenService.createRevokeToken({
            userId:sub,
            jti,
            ttl:iat+REFRESH_TOKEN_EXPIRES_IN
           })

            status=201
            break;
    }
    return status
    }
    async rotateToken (user:HydratedDocument<IUser>,{sub,jti,iat}:{jti:string,iat:number,sub:string},issuer:string){
     if((iat+ACCESS_TOKEN_EXPIRES_IN)*1000>=Date.now()+(30000)){
        throw new ConflictException('CURRENT ACCESS TOKEN STILL VALID');
    } 
                await this.tokenService.createRevokeToken({
                    userId:sub,
                    jti,
                    ttl:iat+REFRESH_TOKEN_EXPIRES_IN
                })


    return await this.tokenService.createLoginCredentials(user,issuer);
    }

    async deleteProfile(user:HydratedDocument<IUser>){
        const account=await this.userRepository.deleteOne({filter:{_id:user._id,force:true}});
        if(!account.deletedCount){
            throw new NotFoundException("INVALID ACCOUNT")
        }
        await this.s3.deleteFolderByPrefix({prefix:`Users/${user._id.toString()}`});
        return account
    }
}

export default new UserService();
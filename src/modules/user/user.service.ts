import { Types, type HydratedDocument } from "mongoose";
import type { IUser } from "../../common/interfaces/user.interface.js";
import { redisService, RedisService } from "../../common/services/redis.service.js";
import { TokenService } from "../../common/services/token.service.js";
import { LogoutEnum } from "../../common/enums/token.enum.js";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../config/config.js";
import { ConflictException, NotFoundException } from "../../common/exceptions/domain.exception.js";
import { s3Service, type S3Service } from "../../common/services/s3.service.js";
import { StorageApproachEnum, UploadApproachEnum } from "../../common/enums/multer.enum.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { ChatRepository } from "../../DB/repository/chat.repository.js";
import type { IChat } from "../../common/interfaces/chat.interface.js";
import { PostRepository } from "../../DB/repository/post.repository.js";
import { CommentRepository } from "../../DB/repository/comment.repository.js";
import { AvailabilityEnum } from "../../common/enums/post.enum.js";
import type { PaginateDto } from "../../common/validation/general.validation.js";
import type { profilePostsParamsDto } from "./user.dto.js";
import { getAvailability } from "../../common/utils/post.js";

export class UserService{
        private readonly redis:RedisService;
        private readonly tokenService:TokenService
        private readonly userRepository:UserRepository
        private readonly chatRepository:ChatRepository
        private readonly s3:S3Service
        private readonly postRepository:PostRepository
        private readonly commentRepository:CommentRepository
    constructor(){
        this.redis=redisService;
        this.chatRepository=new ChatRepository();
        this.tokenService=new TokenService();
        this.userRepository=new UserRepository();
        this.postRepository=new PostRepository();
        this.commentRepository=new CommentRepository();
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

    async profile(user:HydratedDocument<IUser>):Promise<{user:IUser,groups:HydratedDocument<IChat>[]}>{
        await user.populate([{path: "friends"}])
        const groups= await this.chatRepository.find({filter:{$in:{participants:[user._id]}}})
        return {user:user.toJSON(),groups}
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


    async dashboard(user:HydratedDocument<IUser>){
        const [allPosts,allComments/* ,posts */]=await Promise.all([
            this.postRepository.countDocuments({filter:{createdBy:user._id}}),
            this.commentRepository.countDocuments({filter:{createdBy:user._id}}),
            this.postRepository.find({filter:{createdBy:user._id}}),
        ])

        const allFriends=user.friends?.length||0

        const allReactions= await this.postRepository.aggregate<{totalReactions:number;}>([
            {
                $match:{
                    createdBy:user._id
                }
            },

            {
                $group:{
                    _id:null,
                    totalReactions:{
                        $sum:{
                            $size:{
                                $ifNull:["$reactions",[]]
                            }
                        }
                    }
                }
            }
        ]);

        return{
            allPosts,
            allComments,
            allFriends,
            allReactions:allReactions[0]?.totalReactions ?? 0
        }


    }

     async profilePosts({userId}:profilePostsParamsDto,{page,size}:PaginateDto,user:HydratedDocument<IUser>){
        const userProfile=await this.userRepository.findOne({filter:{_id:Types.ObjectId.createFromHexString(userId)}});
        if(!userProfile){
            throw new NotFoundException("Fail To Find The Profile")
        }

        const isOwner=userProfile._id.toString()===user._id.toString();

        const isFriend=userProfile.friends?.some((friendId)=>friendId.toString()===user._id.toString())

        let filter={}

        if(isOwner){
            filter={createdBy:userProfile._id}
        }

        else if(isFriend){
            filter={createdBy:userProfile._id,availability:{$in:[AvailabilityEnum.PUBLIC,AvailabilityEnum.FRIENDS]}}
        }

        else{
            filter={createdBy:userProfile._id,availability:AvailabilityEnum.PUBLIC}
        }

        const posts=await this.postRepository.paginate({
            filter,
            page,
            size,
            options:{
                sort:{createdAt:-1}
            }
        })

        return posts;

    } 

    async newsFeed(
        {page,size,search}:PaginateDto,
        user:HydratedDocument<IUser>
    ){
        const posts=await this.postRepository.paginate({
            filter:{
                $or:getAvailability(user),
                ...(search ? {content : {$regex:search , $options:"i"}} : {})
            },
            page,
            size,
            options:{
                sort:{createdAt:-1},
                populate:[{path:"comments",select: "content"}]
            }
        })

        const feed=posts.docs.map((post)=>{
            const postObject=post.toJSON() as any;
            return{
                ...postObject,
                totalReactions: postObject.reactions?.length || 0,
                totalComments: postObject.comments?.length || 0
            }
        })

        return {...posts, docs:feed}
    }


}

export default new UserService();
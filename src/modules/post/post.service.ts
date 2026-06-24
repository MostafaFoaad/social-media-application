import { Types, type HydratedDocument } from "mongoose";
import type { createPostBodyDto, ReactPostParamsDto, ReactPostQueryDto, UpdatePostBodyDto, UpdatePostParamsDto } from "./post.dto.js";
import type { IUser } from "../../common/interfaces/user.interface.js";
import { redisService, type RedisService } from "../../common/services/redis.service.js";
import { TokenService } from "../../common/services/token.service.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { s3Service, type S3Service } from "../../common/services/s3.service.js";
import { BadException, NotFoundException } from "../../common/exceptions/domain.exception.js";
import { randomUUID } from "node:crypto";
import { PostRepository } from "../../DB/repository/post.repository.js";
import { notificationService, type NotificationService } from "../../common/services/notification.service.js";
import type { IPost } from "../../common/interfaces/post.interface.js";
import { AvailabilityEnum } from "../../common/enums/post.enum.js";
import { getAvailability } from "../../common/utils/post.js";
import type { PaginateDto } from "../../common/validation/general.validation.js";
import type { IPaginate } from "../../common/interfaces/pagination.interface.js";
export class PostService{
            private readonly redis:RedisService;
            private readonly tokenService:TokenService
            private readonly userRepository:UserRepository
            private readonly postRepository:PostRepository
            private readonly notification:NotificationService;
            private readonly s3:S3Service
        constructor(){
            this.redis=redisService;
            this.tokenService=new TokenService();
            this.userRepository=new UserRepository();
            this.postRepository=new PostRepository();
            this.notification= notificationService;
            this.s3=s3Service
    
        }

        async postList({page,search,size}:PaginateDto,user:HydratedDocument<IUser>):Promise<IPaginate<IPost>>{
            const posts=await this.postRepository.paginate({
                filter:{
                    $or:getAvailability(user),
                    ...(search?{content:{$regex:search,$options:"i"}}:{})
                },
                page,
                size,
                options:{
                    populate:[{path:"comments",populate:{path:"reply",populate:{ path:"reply", }}}],
                }
            })

            return posts;
        }

        async createPost({availability,content,tags,files=[]}:createPostBodyDto,user:HydratedDocument<IUser>):Promise<IPost>{
        const mentions:Types.ObjectId[]=[];
        const FCM_Tokens:string[]=[];
        if(tags?.length){
            const mentionedAccounts=await this.userRepository.find({
                filter:{
                    _id:{$in:tags}
                }
            })
            if(mentionedAccounts.length!=tags.length){
                throw new NotFoundException("FAIL TO FIND THE MENTIONED ACCOUNTS")
            }

            for(const tag of tags){
                mentions.push(Types.ObjectId.createFromHexString(tag));
                (await this.redis.getFCMs(tag)||[]).map(token=>FCM_Tokens.push(token))
            }
        }

        const folderId=randomUUID();

        let attachments:string[]=[];
        if(files?.length){
            attachments=await this.s3.uploadAssets({
                files:files as Express.Multer.File[],
                path:`Post/${folderId}`
            })
        }

        const post=await this.postRepository.createOne({
            data:{
                createdBy:user._id,
                content:content as string,
                attachments,
                folderId,
                availability,
                tags:mentions
            }
        })

        if(!post){
            if(attachments.length){
                await this.s3.deleteAssets({
                    Keys:attachments.map(ele=>{return {Key:ele}})
                })
            }

            throw new BadException("FAIL")
        }

        if(FCM_Tokens.length){
            await this.notification.sendNotifications({
                tokens:FCM_Tokens,
                data:{
                    title:"MENTIONS",
                    body:JSON.stringify({
                        message:`${user.username} MENTIONED YOU IN HIS POST`,
                        postId:post._id
                    })
                }
            })
        }

        return post.toJSON()
        }

        async updatePost({postId}:UpdatePostParamsDto,{availability,content,tags=[],files=[],removeFiles=[],removeTags=[]}:UpdatePostBodyDto,user:HydratedDocument<IUser>):Promise<IPost>{
        const post=await this.postRepository.findOne({
            filter:{
                _id:postId,
                createdBy:user._id
            }
        })
        if(!post){
            throw new NotFoundException("FAIL TO FIND THE POST")
        }
        if(!post.content&&!content&&!files?.length&&post.attachments?.length==removeFiles.length){
            throw new BadException("WE CANNOT LEAVE AN EMPTY POST")
        } 
        const mentions:Types.ObjectId[]=[];
        const FCM_Tokens:string[]=[];
        if(tags?.length){
            const mentionedAccounts=await this.userRepository.find({
                filter:{
                    _id:{$in:tags}
                }
            })
            if(mentionedAccounts.length!=tags.length){
                throw new NotFoundException("FAIL TO FIND THE MENTIONED ACCOUNTS")
            }

            for(const tag of tags){
                mentions.push(Types.ObjectId.createFromHexString(tag));
                (await this.redis.getFCMs(tag)||[]).map(token=>FCM_Tokens.push(token))
            }
        }

        const folderId=post.folderId;

        let attachments:string[]=[];
        if(files?.length){
            attachments=await this.s3.uploadAssets({
                files:files as Express.Multer.File[],
                path:`Post/${folderId}`
            })
        }

        const updatePost=await this.postRepository.findOneAndUpdate({
            filter:{
                _id:postId,
                createdBy:user._id
            },
            update:[
                {
                    $set:{
                        content:content||post.content,
                        availability:Number(availability||post.availability),
                        updatedBy:user._id,
                        attachments:{
                            $setUnion:[
                                {
                                    $setDifference:[
                                        "$attachments",
                                        removeFiles
                                    ]
                                },
                                attachments
                            ]
                        },

                        tags:{
                            $setUnion:[
                                {
                                    $setDifference:[
                                        "$tags",
                                        removeTags.map(ele=>{return Types.ObjectId.createFromHexString(ele)})
                                    ]
                                },
                                mentions
                            ]
                        }

                    }
                }
            ]

            
        })

        if(!updatePost){
            if(attachments.length){
                await this.s3.deleteAssets({
                    Keys:attachments.map(ele=>{return {Key:ele}})
                })
            }

            throw new BadException("FAIL")
        }

        if(removeFiles.length){
            await this.s3.deleteAssets({
                Keys:removeFiles.map(ele=>{return {Key:ele}})
            })
        }

        if(FCM_Tokens.length){
            await this.notification.sendNotifications({
                tokens:FCM_Tokens,
                data:{
                    title:"MENTIONS",
                    body:JSON.stringify({
                        message:`${user.username} MENTIONED YOU IN HIS POST`,
                        postId:post._id
                    })
                }
            })
        }

        return updatePost.toJSON()
        }

        async reactPost({postId}:ReactPostParamsDto,{react}:ReactPostQueryDto,user:HydratedDocument<IUser>):Promise<IPost>{
            const post=await this.postRepository.findOneAndUpdate({
                filter:{
                    _id:postId,
                    $or:getAvailability(user)
                },
                update:{
                    ...(Number(react)>0?{$addToSet:{likes:user._id}}:{$pull:{likes:user._id}})
                }
            })

            if(!post){
                throw new NotFoundException("THE POST NOT FOUND")
            }
            return post.toJSON();
        }
}

export const postService= new PostService()
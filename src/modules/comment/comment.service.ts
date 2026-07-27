import { Types, type HydratedDocument } from "mongoose";
import type { CreateCommentBodyDto, CreateCommentParamsDto, ReplyOnCommentParamsDto} from "./comment.dto.js";
import type { IUser } from "../../common/interfaces/user.interface.js";
import { redisService, type RedisService } from "../../common/services/redis.service.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { s3Service, type S3Service } from "../../common/services/s3.service.js";
import { BadException, NotFoundException } from "../../common/exceptions/domain.exception.js";
import { randomUUID } from "node:crypto";
import { PostRepository } from "../../DB/repository/post.repository.js";
//import { notificationService, type NotificationService } from "../../common/services/notification.service.js";
import  { CommentRepository } from "../../DB/repository/comment.repository.js";
import type { IComment } from "../../common/interfaces/comment.interface.js";
import { getAvailability } from "../../common/utils/post.js";
import type { IPost } from "../../common/interfaces/post.interface.js";
export class CommentService{
            private readonly redis:RedisService;
            private readonly commentRepository:CommentRepository;
            private readonly userRepository:UserRepository
            private readonly postRepository:PostRepository
            //private readonly notification:NotificationService;
            private readonly s3:S3Service
        constructor(){
            this.redis=redisService;
            this.userRepository=new UserRepository();
            this.postRepository=new PostRepository();
            this.commentRepository=new CommentRepository();
            //this.notification= notificationService;
            this.s3=s3Service
    
        }

        

        async createComment({postId}:CreateCommentParamsDto,{content,tags,files=[]}:CreateCommentBodyDto,user:HydratedDocument<IUser>):Promise<IComment>{

            const post=await this.postRepository.findOne({
                filter:{
                    _id:postId,
                    $or: getAvailability(user)
                }
            })

            if(!post){
                throw new NotFoundException("POST NOT FOUND")
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

        const comment=await this.commentRepository.createOne({
            data:{
                createdBy:user._id,
                content:content as string,
                attachments,
                postId:post._id,
                tags:mentions
            }
        })

        if(!comment){
            if(attachments.length){
                await this.s3.deleteAssets({
                    Keys:attachments.map(ele=>{return {Key:ele}})
                })
            }

            throw new BadException("FAIL")
        }

        /* if(FCM_Tokens.length){
            await this.notification.sendNotifications({
                tokens:FCM_Tokens,
                data:{
                    title:"MENTIONS",
                    body:JSON.stringify({
                        message:`${user.username} MENTIONED YOU IN HIS COMMENT`,
                        postId:post._id,
                        commentId:comment._id
                    })
                }
            })
        } */

        return comment.toJSON()
        }

        async replyOnComment({postId,commentId}:ReplyOnCommentParamsDto,{content,tags,files=[]}:CreateCommentBodyDto,user:HydratedDocument<IUser>):Promise<IComment>{

            const comment=await this.commentRepository.findOne({
                filter:{
                    _id:commentId,
                    postId:postId, 
                },
                options:{
                    populate:[{path:"postId",match:{$or:getAvailability(user)}}]
                }
            })

            if(!comment?.postId){
                throw new NotFoundException("POST NOT FOUND")
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
        const post=comment.postId as HydratedDocument<IPost>;
        const folderId=post.folderId;

        let attachments:string[]=[];
        if(files?.length){
            attachments=await this.s3.uploadAssets({
                files:files as Express.Multer.File[],
                path:`Post/${folderId}`
            })
        }

        const reply=await this.commentRepository.createOne({
            data:{
                createdBy:user._id,
                content:content as string,
                attachments,
                postId:post._id,
                commentId:comment._id,
                tags:mentions
            }
        })

        if(!reply){
            if(attachments.length){
                await this.s3.deleteAssets({
                    Keys:attachments.map(ele=>{return {Key:ele}})
                })
            }

            throw new BadException("FAIL")
        }

        /* if(FCM_Tokens.length){
            await this.notification.sendNotifications({
                tokens:FCM_Tokens,
                data:{
                    title:"MENTIONS",
                    body:JSON.stringify({
                        message:`${user.username} MENTIONED YOU IN HIS COMMENT`,
                        postId:post._id,
                        commentId:comment._id,
                        replyId:reply._id
                    })
                }
            })
        } */

        return reply.toJSON(); 
        }

        
} 

export const commentService= new CommentService();
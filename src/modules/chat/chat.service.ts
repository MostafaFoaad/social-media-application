import { Types, type HydratedDocument } from "mongoose";
import { ChatRepository } from "../../DB/repository/chat.repository.js";
import type { IUser } from "../../common/interfaces/user.interface.js";
import { NotFoundException } from "../../common/exceptions/domain.exception.js";
import type { IChat } from "../../common/interfaces/chat.interface.js";
import { ChatEnum } from "../../common/enums/chat.enum.js";
import  { UserRepository } from "../../DB/repository/user.repository.js";
import  { s3Service,S3Service } from "../../common/services/s3.service.js";
import { randomUUID } from "node:crypto";

export class ChatService{
    private chatRepository:ChatRepository
    private userRepository:UserRepository
    private s3Service:S3Service
    constructor(){
        this.chatRepository= new ChatRepository();
        this.userRepository=new UserRepository();
        this.s3Service=s3Service
    }

    async getChat(participantId:string,{page,size}:{page:string,size:string},user:HydratedDocument<IUser>):Promise<IChat>{
        const chat = await this.chatRepository.findOneChat({
            filter:{
                participants:{$all:[user._id,Types.ObjectId.createFromHexString(participantId)]}
            },
            options:{
                populate:[{path:"participants"}]
            },
            page,
            size
        })

        if(!chat){
            throw new NotFoundException("FAIL TO FIND THE CHAT")
        }
        return chat.toJSON();
    }

    async getGroupChat(groupId:string,{page,size}:{page:string,size:string},user:HydratedDocument<IUser>):Promise<IChat>{
        const chat = await this.chatRepository.findOneChat({
            filter:{
                _id:Types.ObjectId.createFromHexString(groupId),
                participants:{$in:[user._id]},
                type:ChatEnum.ovm
            },
            options:{
                populate:[{path:"participants"},{path:"message.createdBy"}]
            },
            page,
            size
        })

        if(!chat){
            throw new NotFoundException("FAIL TO FIND THE CHAT")
        }
        return chat.toJSON();
    }


    async sendMessage({content,sendTo}:{content:string,sendTo:string},user:HydratedDocument<IUser>):Promise<void>{
        let chat=await this.chatRepository.findOneAndUpdate({
            filter:{
                participants:{$all:[user._id,Types.ObjectId.createFromHexString(sendTo)]},
                type:ChatEnum.ovo
            },

            update:{
                $addToSet:{
                    message:{
                        content,
                        createdBy:user._id
                    }
                }
            }
        })

        if(!chat){
            chat=await this.chatRepository.createOne({
                data:{
                    participants:[user._id,Types.ObjectId.createFromHexString(sendTo)],
                    createdBy:user._id,
                    type:ChatEnum.ovo,
                    message:[{
                        content,
                        createdBy:user._id
                    }]
                }
            })
        }
}

   async sendGroupMessage({content,groupId}:{content:string,groupId:string},user:HydratedDocument<IUser>):Promise<string>{
        let chat=await this.chatRepository.findOneAndUpdate({
            filter:{
                _id:Types.ObjectId.createFromHexString(groupId),
                participants:{$in:[user._id]},
                type:ChatEnum.ovm
            },

            update:{
                $addToSet:{
                    message:{
                        content,
                        createdBy:user._id
                    }
                }
            }
        })

        if(!chat){
            throw new NotFoundException("Not Found Group ")
        }
        return chat.roomId
}


async createGroup({participantsIds=[],group}:{participantsIds:string[]|Types.ObjectId[],group:string},user:HydratedDocument<IUser>,file?:Express.Multer.File):Promise<IChat>{
    participantsIds=[...new Set(participantsIds.map(ele=>{return Types.ObjectId.createFromHexString(ele as string)}))];
    const users=await this.userRepository.find({filter:{
        _id:{$in:participantsIds},
        friends:{$in:[user._id]}
    }
})

    if(users.length!=participantsIds.length){
        throw new NotFoundException("fail to find the participants")
    }
    let group_image!:string
    const roomId=randomUUID();
    const path=`Chat/group/${roomId}`;
     if(file){
        group_image=await this.s3Service.uploadAsset({
            path,
            file
        })
    } 

    const chattingGroup=await this.chatRepository.createOne({
        data:{
            participants:[...participantsIds,user._id],
            createdBy:user._id,
            message:[],
            type:ChatEnum.ovm,
            group,
            roomId,
            group_image,


        }
    })


    return chattingGroup.toJSON();

}

}

export const chatService=new ChatService();
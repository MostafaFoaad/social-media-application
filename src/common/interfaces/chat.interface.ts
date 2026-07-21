import type { Types } from "mongoose"
import type { IUser } from "./user.interface.js"
import type { ChatEnum } from "../enums/chat.enum.js"

export interface IMessage{
    _id:Types.ObjectId,
    content?:string,
    attachments?:string[],
    likes:Types.ObjectId[],
    tags?:Types.ObjectId[]|IUser[],
    createdBy:Types.ObjectId|IUser,
    createdAt:Date,
    deletedAt?:Date,
    restoredAt?:Date,
    updatedAt?:Date

}

export interface IChat{
        participants:Types.ObjectId[]|IUser[],
        createdBy:Types.ObjectId|IUser,
        message:IMessage[],
        type:ChatEnum,
        group:string,
        group_image:string,
        roomId:string

        createdAt:Date,
        deletedAt?:Date,
        restoredAt?:Date,
        updatedAt?:Date
}
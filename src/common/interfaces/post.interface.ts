import type { Types } from "mongoose";
import type { IUser } from "./user.interface.js";
import type { AvailabilityEnum } from "../enums/post.enum.js";

export interface IPost{
    folderId:string,
    content?:string,
    attachments?:string[],
    likes?:Types.ObjectId[]|IUser[],
    tags?:Types.ObjectId[]|IUser[],
    availability:AvailabilityEnum,
    createdBy:Types.ObjectId|IUser,
    updatedBy?:Types.ObjectId|IUser,
    createdAt:Date,
    deletedAt?:Date,
    restoredAt?:Date,
    updatedAt?:Date
}
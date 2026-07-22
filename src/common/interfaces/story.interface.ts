import type { Types } from "mongoose";

export interface IStoryViews{
    user:Types.ObjectId,
    viewedAt:Date
}

export interface IStory{
    owner:Types.ObjectId,
    text?:string,
    backgroundColor?:string,
    attachmentUrl?:string,
    views?:IStoryViews[],
    excludedUsers?:Types.ObjectId[],
    expiredAt:Date,
    createdAt:Date,
    updatedAt?:Date
}
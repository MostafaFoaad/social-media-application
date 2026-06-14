import type { HydratedDocument } from "mongoose"
import type { IUser } from "../interfaces/user.interface.js"
import { AvailabilityEnum } from "../enums/post.enum.js"

export const getAvailability=(user:HydratedDocument<IUser>)=>{
    return [
            {availability:AvailabilityEnum.PUBLIC},
            {availability:AvailabilityEnum.ONLY_ME,createdBy:user._id},
            {availability:AvailabilityEnum.FRIENDS,createdBy:{$in:[user._id,...(user.friends||[])]}},
            {tags:{$in:[user._id]}}
    ];
}
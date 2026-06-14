import type { Types } from "mongoose";
import type { GenderEnum, ProviderEnum, RoleEnum } from "../enums/index.js";

export interface IUser{
    firstName:string;
    lastName:string;
    username?:string;
    friends?:Types.ObjectId[]|IUser[];
    email:string;
    password:string;
    phone?:string;
    profilePicture?:string;
    profileCoverPictures?:string[];
    gender:GenderEnum;
    role:RoleEnum;
    provider:ProviderEnum;
    changeCredentialsTime?:Date;
    DOB?:Date;
    confirmEmail?:Date;
    createdAt?:Date;
    updatedAt?:Date;
    deletedAt?:Date;
    restoredAt?:Date;
}
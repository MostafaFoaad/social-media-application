import type { HydratedDocument } from "mongoose";
import userService, { UserService } from "../user.service.js";
import type { IUser } from "../../../common/interfaces/user.interface.js";
import type { JwtPayload } from "jsonwebtoken";
import { gqlAuthorization } from "../../../middleware/authorization.middleware.js";
import { RoleEnum } from "../../../common/enums/user.enum.js";
import { gqlValidation } from "../../../middleware/validation.middleware.js";
import { profileGql } from "../user.validation.js";

export class UserResolver{
    private userService:UserService
    constructor(){
        this.userService=userService
    }

    profile=async (parent:unknown,args:{search?:string},{user}:{user:HydratedDocument<IUser>,decoded:JwtPayload})=>{

        await gqlAuthorization([RoleEnum.USER],user)
        await gqlValidation<{search?:string}>(profileGql,args)
        const data=await this.userService.profile(user)
        return {message:"HELLO PROFILE DATA",data}
    }
}

export const userResolver=new UserResolver();
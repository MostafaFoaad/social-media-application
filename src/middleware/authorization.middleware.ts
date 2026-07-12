import type { RoleEnum } from "../common/enums/user.enum.js";
import {type Request,type Response, type NextFunction } from "express";
import { ForbiddenException, gqlErrors } from "../common/exceptions/domain.exception.js";
import type { HydratedDocument } from "mongoose";
import type { IUser } from "../common/interfaces/user.interface.js";
import { GraphQLError } from "graphql";

export const authorization=(accessRoles:RoleEnum[])=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
        if(!accessRoles.includes(req.user.role)){
            throw new ForbiddenException('NOT AUTHORIZED ACCOUNT');
        }
        return next();
    }
}


export const gqlAuthorization=async (accessRoles:RoleEnum[],user:HydratedDocument<IUser>):Promise<boolean>=>{
        if(!accessRoles.includes(user.role)){
            throw gqlErrors(new ForbiddenException('NOT AUTHORIZED ACCOUNT'));
        }
        return true
}
import type { RoleEnum } from "../common/enums/user.enum.js";
import {type Request,type Response, type NextFunction } from "express";
import { ForbiddenException } from "../common/exceptions/domain.exception.js";

export const authorization=(accessRoles:RoleEnum[])=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
        if(!accessRoles.includes(req.user.role)){
            throw new ForbiddenException('NOT AUTHORIZED ACCOUNT');
        }
        return next();
    }
}
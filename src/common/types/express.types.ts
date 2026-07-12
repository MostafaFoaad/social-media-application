import type { HydratedDocument } from "mongoose";
import type { IUser } from "../interfaces/user.interface.js";
import type { JwtPayload } from "jsonwebtoken";
import type { Socket } from "socket.io";

declare module "express-serve-static-core"{
    interface Request{
        user:HydratedDocument<IUser>,
        decoded:JwtPayload
    }
}


export interface IAuthUser {user:HydratedDocument<IUser>,decoded:JwtPayload}

export interface IAuthSocket extends Socket{
    data:IAuthUser
}
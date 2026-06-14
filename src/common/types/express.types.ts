import type { HydratedDocument } from "mongoose";
import type { IUser } from "../interfaces/user.interface.js";
import type { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core"{
    interface Request{
        user:HydratedDocument<IUser>,
        decoded:JwtPayload
    }
}
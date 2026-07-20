import type { HydratedDocument } from "mongoose";
import { postService,PostService } from "../post.service.js";
import type { IUser } from "../../../common/interfaces/user.interface.js";
import type { JwtPayload } from "jsonwebtoken";
import { paginationValidationSchema, type PaginateDto } from "../../../common/validation/general.validation.js";
import { gqlValidation } from "../../../middleware/validation.middleware.js";
import type { ReactionsOnPostGQLDto, ReactOnPostGQLDto } from "../post.dto.js";
import { reactionsOnPostGQL, reactPostGQL } from "../post.validation.js";

export class PostListResolver{
    private postService:PostService
    constructor(){
        this.postService=postService
    }

    postList=async (parent:unknown,args:PaginateDto,{user,decoded}:{user:HydratedDocument<IUser>,decoded:JwtPayload})=>{
        await gqlValidation<PaginateDto>(paginationValidationSchema.query,args)
        const data=await this.postService.postList(args,user)
        return {message:"HELLO POSTLIST DATA",data}
    }


   reactOnPost=async (parent:unknown,{postId,react}:ReactOnPostGQLDto,{user,decoded}:{user:HydratedDocument<IUser>,decoded:JwtPayload})=>{
        await gqlValidation<ReactOnPostGQLDto>(reactPostGQL,{postId,react})
        const data=await this.postService.reactPost({postId},{react},user)
        return {message:"HELLO POSTLIST DATA",data}
    }

    reactionsOnPost=async (parent:unknown,{postId,react}:ReactionsOnPostGQLDto,{user,decoded}:{user:HydratedDocument<IUser>,decoded:JwtPayload})=>{
        await gqlValidation<ReactionsOnPostGQLDto>(reactionsOnPostGQL,{postId,react})
        const data=await this.postService.reactionsOnPost({postId},{react},user)
        return {message:"HELLO POSTLIST DATA",data}
    }
}

export const postListResolver=new PostListResolver();
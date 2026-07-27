import {z} from "zod";
//import { Types } from "mongoose";
import { generalValidationFields } from "../../common/validation/general.validation.js";
export const createComment={
    params:z.strictObject({
        postId:generalValidationFields.id
    }),
    body:z.strictObject({
        content:z.string().optional(),
        files:z.array(z.any()).optional(),
        tags:z.array(generalValidationFields.id).optional(),
    }).superRefine((args,ctx)=>{
        if(!args.files?.length&&!args.content){
            ctx.addIssue({
                code:"custom",
                path:["content"],
                message:"content is required"
            })     
        }

        if(args.tags?.length){
            const uniqueTags=[...new Set(args.tags)];

            if(uniqueTags.length!=args.tags.length){
                ctx.addIssue({
                    code:"custom",
                    path:["tags"],
                    message:"Dublicated tag"
                })
            }
            
        }
    })
}

export const replyOnComment={
    params:z.strictObject({
        postId:generalValidationFields.id,
        commentId:generalValidationFields.id
    }),
    body:createComment.body
}
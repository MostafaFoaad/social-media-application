import {z} from "zod";
import { AvailabilityEnum } from "../../common/enums/post.enum.js";
import { Types } from "mongoose";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { ReactTypeEnum } from "../../common/enums/react.enum.js";
export const createPost={
    body:z.strictObject({
        content:z.string().optional(),
        files:z.array(z.any()).optional(),
        tags:z.array(z.string()).optional(),
        availability:z.coerce.number().default(AvailabilityEnum.PUBLIC),
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
            for(const tag of args.tags){
                if(!Types.ObjectId.isValid(tag)){
                    ctx.addIssue({
                        code:"custom", path:["tags"],message:"INVALID TAGGED OBJECTID"
                    })
                }
            }
        }
    })
}

export const updatePost={
    params:z.strictObject({
        postId:generalValidationFields.id
    }),
    body:z.strictObject({
        content:z.string().optional(),
        removeFiles:z.array(z.string()).optional(),
        removeTags:z.array(z.string()).optional(),
        files:z.array(z.any()).optional(),
        tags:z.array(generalValidationFields.id).optional(),
        availability:z.coerce.number().optional()
    }).superRefine((args,ctx)=>{
        if(!Object.values(args)?.length){
            ctx.addIssue({
                code:"custom",
                message:"inserting data is required to update"
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

export const reactPost={
    params:z.strictObject({
        postId:generalValidationFields.id
    }),

    query:z.strictObject({
        react:z.coerce.number()
    })
}

export const reactionsOnPost={
    params:z.strictObject({
        postId:generalValidationFields.id
    }),

    query:z.strictObject({
        react:z.enum(ReactTypeEnum)
    })
}

export const reactionsOnPostGQL=z.strictObject({
        postId:generalValidationFields.id,
        react:z.enum(ReactTypeEnum)
    })



export const reactPostGQL=z.strictObject({
    postId:generalValidationFields.id,
    react:z.coerce.number()
})
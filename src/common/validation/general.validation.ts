import { Types } from 'mongoose';
import {z} from 'zod';

export const generalValidationFields={
        id:z.string().refine(value=>{return Types.ObjectId.isValid(value)},"INVALID OBJECT ID"),
        email:z.email(),
        phone:z.string({error:"PHONE IS REQUIRED"}).regex(/^(00201|\+201|01)(0|1|2|5)\d{8}$/),
        otp:z.string({error:"OTP IS REQUIRED"}).regex(/^\d{6}$/),
        password:z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/,{error:"weak password"}),
        username:z.string({error:"username is mandatory"}).min(2,{error:"min is 2 char"}).max(25,{error:"max is 25"}),
        confirmPassword:z.string(),
        file:function(mimetype:string[]){
                return z.strictObject({
                        fieldname:z.string(),
                        originalname:z.string(),
                        encoding:z.string(),
                        mimetype:z.enum(mimetype),
                        buffer:z.any().optional(),
                        path:z.string().optional(),
                        size:z.number(),
                        destination:z.string().optional(),
                        filename:z.string().optional()
                }).superRefine((args,ctx)=>{
                        if(!args.path&&!args.buffer){
                                ctx.addIssue({code:"custom",message:"buffer is required",path:['buffer']})
                        }
                })
        }
}

export const paginationValidationSchema={
        query:z.strictObject({
                page:z.coerce.number().optional(),
                size:z.coerce.number().optional(),
                search:z.string().optional()
        })
}

export type PaginateDto=z.infer<typeof paginationValidationSchema.query>
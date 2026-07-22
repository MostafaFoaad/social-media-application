import {z} from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { fileFieldValidation } from "../../common/utils/multer/validation.multer.js";
export const createStory={
    body:z.strictObject({
        text:z.string().optional(),
        excludedUsers:z.array(generalValidationFields.id).optional(),
        backgroundColor:z.string().regex(/^#[0-9A-Za-z]{3}|[0-9A-Za-z]{6}$/).default("#000"),
        file:generalValidationFields.file([...fileFieldValidation.image]).optional(),

    }).superRefine((args,ctx)=>{
        if(args.excludedUsers?.length){
            const uniqueExcludedUsers=[...new Set(args.excludedUsers)];
            if(uniqueExcludedUsers.length!==args.excludedUsers.length){
                ctx.addIssue({
                code:"custom",
                message:"Excluded users must be unique",
                path:["excludedUsers"]
            })
        }
        }

        if(!args.file&&!args.text){
            ctx.addIssue({
                code:"custom",
                message:"Either text or file must be provided",
                path:["text"]
            })
        }


        
    })
}
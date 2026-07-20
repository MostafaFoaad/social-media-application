import {z} from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";

export const profileGql=z.strictObject({
    search:z.string().min(2).optional()
})

export const profilePosts={
    params:z.strictObject({userId:generalValidationFields.id})
}
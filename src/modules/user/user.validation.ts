import {z} from "zod";

export const profileGql=z.strictObject({
    search:z.string().min(2).optional()
})
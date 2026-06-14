import multer from "multer"
import type { Request } from "express"
import { tmpdir } from "node:os"
import { randomUUID } from "node:crypto"
import { fileFilter } from "./index.js"
export const cloudFileUpload=({
    validation=[],
    maxSize=2

}:{
    validation?:string[],
    maxSize?:number
})=>{
    const storage=multer.diskStorage({

        destination:function(req:Request,file:Express.Multer.File,callback:(error:Error|null,destination:string)=>void){
            callback(null,tmpdir())
        },

        filename:function(req:Request,file:Express.Multer.File,callback:(error:Error|null,destination:string)=>void){
            callback(null,`${randomUUID()}__${file.originalname}`)
        }

    })
    return multer({fileFilter:fileFilter(validation),storage,limits:{fileSize:maxSize*1024*1024}})
}
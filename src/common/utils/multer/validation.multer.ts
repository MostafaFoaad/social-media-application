import type { FileFilterCallback } from "multer"
import { BadException } from "../../exceptions/domain.exception.js"
import type { Request } from "express"
export const fileFieldValidation={
    image:['image/jpeg', 'image/jpg', 'image/png'],
    video:['video/mp4']
}

export const fileFilter=(validation:string[])=>{
    return function(req:Request,file:Express.Multer.File,cb:FileFilterCallback){
        if(!validation.includes(file.mimetype)){
            return cb(new BadException('INVALID FILE FORMAT'))
        }
        return cb(null,true)
    }
}
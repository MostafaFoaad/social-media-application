import { type NextFunction, type Request , type Response, Router } from "express";
import { fileFieldValidation } from "../../common/utils/multer/validation.multer.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { successResponse } from "../../common/response/success.response.js";
import * as validators from "./comment.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { commentService } from "./comment.service.js";
import type { CreateCommentParamsDto, ReplyOnCommentParamsDto } from "./comment.dto.js";
import type { IComment } from "../../common/interfaces/comment.interface.js";
/* import { paginationValidationSchema, type PaginateDto } from "../../common/validation/general.validation.js";
import type { ReactPostParamsDto, ReactPostQueryDto, UpdatePostBodyDto, UpdatePostParamsDto } from "./post.dto.js"; */
const router=Router({mergeParams:true});


router.post("/",
    authentication(),
    cloudFileUpload({
        validation:fileFieldValidation.image,
    }).array("attachments",2),
    validation(validators.createComment),
    async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const data=await commentService.createComment(req.params as CreateCommentParamsDto,{...req.body,files:req.files},req.user);
    return successResponse<IComment>({res,status:201,data})

})

router.post("/:commentId/reply",
    authentication(),
    cloudFileUpload({
        validation:fileFieldValidation.image,
    }).array("attachments",2),
    validation(validators.replyOnComment),
    async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const data=await commentService.replyOnComment(req.params as ReplyOnCommentParamsDto,{...req.body,files:req.files},req.user);
    return successResponse<IComment>({res,status:201,data})

})




export default router
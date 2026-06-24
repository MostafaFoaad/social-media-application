import { type NextFunction, type Request , type Response, Router } from "express";
import { fileFieldValidation } from "../../common/utils/multer/validation.multer.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { successResponse } from "../../common/response/success.response.js";
import * as validators from "./post.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { postService } from "./post.service.js";
import { paginationValidationSchema, type PaginateDto } from "../../common/validation/general.validation.js";
import type { ReactPostParamsDto, ReactPostQueryDto, UpdatePostBodyDto, UpdatePostParamsDto } from "./post.dto.js";
import { commentRouter } from "../comment/index.js";
const router=Router();

router.use("/:postId/comment",commentRouter);

router.get("/",
    authentication(),
    validation(paginationValidationSchema),
    async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const data=await postService.postList(req.query as PaginateDto,req.user);
    return successResponse({res,status:200,data})

})

router.post("/",
    authentication(),
    cloudFileUpload({
        validation:fileFieldValidation.image,
    }).array("attachments",2),
    validation(validators.createPost),
    async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const data=await postService.createPost({...req.body,files:req.files},req.user);
    return successResponse({res,status:201,data})

})

router.patch("/:postId",
    authentication(),
    cloudFileUpload({
        validation:fileFieldValidation.image,
    }).array("attachments",2),
    validation(validators.updatePost),
    async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const data=await postService.updatePost(req.params as UpdatePostParamsDto,req.body as UpdatePostBodyDto,req.user);
    return successResponse({res,status:200,data})

})

router.patch("/:postId/react",
    authentication(),
    validation(validators.reactPost),
    async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const data=await postService.reactPost(req.params as ReactPostParamsDto,req.query as unknown as ReactPostQueryDto,req.user);
    return successResponse({res,status:200,data})

})


export default router
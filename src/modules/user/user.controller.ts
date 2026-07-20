import { type Request,type Response,type NextFunction,Router } from "express";
import userService from "./user.service.js";
import { successResponse } from "../../common/response/success.response.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { authorization } from "../../middleware/authorization.middleware.js";
import { RoleEnum } from "../../common/enums/user.enum.js";
import { TokenTypeEnum } from "../../common/enums/token.enum.js";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer/index.js";
import { chatRouter } from "../chat/index.js";
import type { profilePostsParamsDto } from "./user.dto.js";
import type { PaginateDto } from "../../common/validation/general.validation.js";
const router=Router();
router.use("/:userId/chat",chatRouter)
/* router.patch("/profile-image",
    authentication(),
    cloudFileUpload({
        validation:fileFieldValidation.image,
    }).single("attachment"),
    async(req:Request,res:Response,next:NextFunction)=>{
    const data=await userService.profileImage(req.file as Express.Multer.File,req.user)
    return successResponse({res,data})
}) */

router.patch("/profile-image",
    authentication(),
    async(req:Request,res:Response,next:NextFunction)=>{
    const data=await userService.profileImage(req.body,req.user)
    return successResponse({res,data})
})

router.delete("/",
    authentication(),
    async(req:Request,res:Response,next:NextFunction)=>{
    const data=await userService.deleteProfile(req.user)
    return successResponse({res,data})
})

router.patch("/profile-cover-images",
    authentication(),
    cloudFileUpload({
        validation:fileFieldValidation.image,
    }).array("attachments",2),
    async(req:Request,res:Response,next:NextFunction)=>{
    const data=await userService.profileCoverImages(req.files as Express.Multer.File[],req.user)
    return successResponse({res,data})
})

router.get("/",
    authentication(),
    authorization([RoleEnum.USER]),
    async(req:Request,res:Response,next:NextFunction)=>{
    const data=await userService.profile(req.user);
    return successResponse({res,data})
})

router.get("/dashboard",
    authentication(),
    authorization([RoleEnum.USER]),
    async(req:Request,res:Response,next:NextFunction)=>{
    const data=await userService.dashboard(req.user);
    return successResponse({res,data})
})

router.get("/:userId/posts",
    authentication(),
    authorization([RoleEnum.USER]),
    async(req:Request,res:Response,next:NextFunction)=>{
    const data=await userService.profilePosts(req.params as profilePostsParamsDto,req.query as PaginateDto,req.user);
    return successResponse({res,data})
})

router.get("/feed",
    authentication(),
    authorization([RoleEnum.USER]),
    async(req:Request,res:Response,next:NextFunction)=>{
    const data=await userService.newsFeed(req.query as PaginateDto,req.user);
    return successResponse({res,data})
})

router.post('/logout',authentication(),async(req,res,next)=>{
    const data=await userService. logout(req.body,req.user,req.decoded as {jti:string,iat:number,sub:string});
    return successResponse({res,data})
})

router.post("/rotate-token",
    authentication(TokenTypeEnum.REFRESH),
    async(req,res,next)=>{
    const result=await userService. rotateToken(req.user,req.decoded as {jti:string,iat:number,sub:string},`${req.protocol}://${req.host}`);
    return successResponse({res,status:201,data:{...result}})
})

export default router;

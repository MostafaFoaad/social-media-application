import { type Request,type Response,type NextFunction,Router } from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
import { chatService } from "./chat.service.js";
import { successResponse } from "../../common/response/success.response.js";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer/index.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./chat.validation.js";
import type { LikeMessageParamsDto } from "./chat.dto.js";
const router=Router({mergeParams:true})
router.get(
    "/",
    authentication(),
    async (req:Request,res:Response,next:NextFunction)=>{
        const chat = await chatService.getChat(req.params.userId as string,req.query as unknown as {page:string,size:string},req.user);
        return successResponse({res,data:{chat}})
    }

)

router.get(
    "/group/:groupId",
    authentication(),
    async (req:Request,res:Response,next:NextFunction)=>{
        const chat = await chatService.getGroupChat(req.params.groupId as string,req.query as unknown as {page:string,size:string},req.user);
        return successResponse({res,data:{chat}})
    }

)
    router.post(
    "/group",
    authentication(),
    cloudFileUpload({validation:fileFieldValidation.image}).single("attachment"),
    async (req:Request,res:Response,next:NextFunction)=>{
        const chat = await chatService.createGroup(req.body,req.user,req.file as Express.Multer.File);
        return successResponse({res,data:{chat}})
    }

    )

    router.patch("/:chatId/messages/:messageId/like",
        authentication(),
        validation(validators.likeMessage),
        async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
            const data=await chatService.likeMessage(req.params as LikeMessageParamsDto,req.user);
        return successResponse({res,status:200,data})
    
    })
export default router;
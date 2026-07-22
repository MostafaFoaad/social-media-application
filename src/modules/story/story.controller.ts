import { type NextFunction, type Request , type Response, Router } from "express";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer/index.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import * as validators from "./story.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { storyService } from "./story.service.js";
import { successResponse } from "../../common/response/success.response.js";

const router=Router();
router.post("/",
    authentication(),
    cloudFileUpload({
        validation:[
            ...fileFieldValidation.image
        ]
    }).single("attachment"),
    validation(validators.createStory),
    async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const data=await storyService.createStory(req.user,{...req.body,files:req.files});
    return successResponse({res,status:201,data})

})

export default router;
import { type NextFunction, type Request , type Response, Router } from "express";
import authService from "./auth.service.js";
import { successResponse } from "../../common/response/index.js";
import * as validators from './auth.validation.js'
import { validation } from "../../middleware/validation.middleware.js";
import type { ILoginResponse } from "./auth.entity.js";
const router=Router();
router.post("/login",validation(validators.login),async (req:Request,res:Response,next:NextFunction):Promise<Response>=>{
    
    const data =await authService.login(req.body,`${req.protocol}://${req.host}`)
    return successResponse<ILoginResponse>({res,data})
})
router.post ("/signup",validation(validators.signup),async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
    
    const data =await authService.signup(req.body)
    return successResponse<any>({res,status:201,data})
})

router.patch("/confirm-email",validation(validators.confirmEmail),  async (req, res, next) => {
       
    await authService.confirmEmail(req.body)
    return successResponse({res,data:"DONE"})
});

router.patch("/resend-confirm-email",validation(validators.resendConfirmEmail), async (req, res, next) => {
       
    await authService.resendConfirmEmail(req.body)
    return successResponse({res,data:"Done"})
});
export default router;
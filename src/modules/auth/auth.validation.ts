import {z} from 'zod';
import { generalValidationFields } from '../../common/validation/index.js';

export const resendConfirmEmail={
    body:z.strictObject({
        email:generalValidationFields.email,
    })
}

export const confirmEmail={
    body:resendConfirmEmail.body.safeExtend({
        otp:generalValidationFields.otp,
    })
}

export const login={
    body:resendConfirmEmail.body.safeExtend({
        password:generalValidationFields.password,
        FCM:z.string().optional()
    })
}

export const signup={
    body:login.body.safeExtend({
        username:generalValidationFields.username,
        phone:generalValidationFields.phone.optional(),
        confirmPassword:generalValidationFields.confirmPassword
    }).refine((data)=>{
        return data.password===data.confirmPassword
    },{error:"password mismatch with confirm password"})
}
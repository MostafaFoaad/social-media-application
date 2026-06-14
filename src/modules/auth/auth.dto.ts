/* export interface LoginDto{
    email:string,
    password:string,
}
export interface SignupDto extends LoginDto{
    username:string,
} */
import {z} from "zod";
import { confirmEmail, login, resendConfirmEmail, signup } from "./auth.validation.js";
export type SignupDto=z.infer<typeof signup.body>;
export type LoginDto=z.infer<typeof login.body>;
export type ConfirmEmailOtpDto=z.infer<typeof confirmEmail.body>;
export type ResendConfirmEmailDto=z.infer<typeof resendConfirmEmail.body>;
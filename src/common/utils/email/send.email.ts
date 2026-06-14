import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer/index.js";
import { APPLICATION_NAME, EMAIL_APP, EMAIL_APP_PASSWORD } from "../../../config/config.js";
export const sendEmail=async({
    to,
    subject,
    html,
    attachments=[]
}:Mail.Options):Promise<void>=>{


    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:EMAIL_APP,
            pass:EMAIL_APP_PASSWORD,
        },
    });

    const info=await transporter.sendMail({
        to,
        subject,
        html,
        attachments,
        from:`"${APPLICATION_NAME}" <${EMAIL_APP}>`
    });

    console.log("message sent:",info.messageId)
}
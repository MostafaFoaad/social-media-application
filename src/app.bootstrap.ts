import express from "express";
import { authRouter, postRouter } from "./modules/index.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import { PORT } from "./config/config.js";
import connectDB from "./DB/connection.db.js";
import { redisService } from "./common/services/redis.service.js";
import { userRouter } from "./modules/user/index.js";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { s3Service } from "./common/services/s3.service.js";
import { successResponse } from "./common/response/success.response.js";
import cors from "cors";
import { notificationService } from "./common/services/notification.service.js";
const s3WriteStream=promisify(pipeline);
const bootStrap=async():Promise<void>=>{
    const app:express.Express=express();
    app.use(cors(),express.json());
    app.get("/",(req:express.Request,res:express.Response,next:express.NextFunction):express.Response=>{
        return res.status(200).json({message:"LANDING PAGE"});
    });

    app.post("/send-notification",async(req:express.Request,res:express.Response,next:express.NextFunction):Promise<express.Response>=>{
        console.log({token:req.body.token})
        await notificationService.sendNotification({
            token:req.body.token,
            data:{
                title:"first",
                body:"hello world"
            }
        })
        return res.status(200).json({message:"LANDING PAGE"});
    });
    app.use("/auth",authRouter);
    app.use("/user",userRouter);
    app.use("/post",postRouter);
    app.get("/uploads/*path",async(req:express.Request,res:express.Response,next:express.NextFunction)=>{
        const {download,fileName}=req.query as {download:string,fileName:string};
        const {path}=req.params as{path:string[]};
        const Key=path.join("/");
        const {Body,ContentType}=await s3Service.getAsset({Key});
        res.setHeader(
      "Content-Type",
      ContentType || "application/octet-stream"
    );
      res.set("Cross-Origin-Resource-Policy", "cross-origin");

      if(download==="true"){
        res.setHeader("Content-Disposition", `attachment; filename="${fileName||Key.split("/").pop()}"`);
      }

    return await s3WriteStream(Body as NodeJS.ReadableStream, res);
    })

    app.get("/pre-signed/*path",async(req:express.Request,res:express.Response,next:express.NextFunction)=>{
        const {download,fileName}=req.query as {download:string,fileName:string};
        const {path}=req.params as{path:string[]};
        const Key=path.join("/");
        const url=await s3Service.getPreSignedUploadLink({Key,fileName,download});
        return successResponse({res,data:{url}});
    })

    app.get("/*dummy",(req:express.Request,res:express.Response,next:express.NextFunction):express.Response=>{
        return res.status(404).json({message:"INVALID APPLICATION ROUTING"});
    })

    app.use(globalErrorHandler);
    await connectDB();
    await redisService.connect();
    app.listen(PORT,()=>{
        console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
    })
    console.log("APPLICATION BOOTSTRAPED SUCCESSFULLY");
}
export default bootStrap;
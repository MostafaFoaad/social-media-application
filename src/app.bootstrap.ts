import express from "express";
import { authRouter, postRouter, realTimeGateway } from "./modules/index.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import { PORT } from "./config/config.js";
import connectDB from "./DB/connection.db.js";
import { RedisService, redisService } from "./common/services/redis.service.js";
import { userRouter } from "./modules/user/index.js";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { s3Service } from "./common/services/s3.service.js";
import { successResponse } from "./common/response/success.response.js";
import cors from "cors";
import { notificationService } from "./common/services/notification.service.js";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./modules/graphql/schema.gql.js";
import { authentication } from "./middleware/authentication.middleware.js";
import {Server, Socket} from "socket.io";
import {Server as HttpServerType} from "node:http";
import { TokenService } from "./common/services/token.service.js";
import type { IAuthSocket } from "./common/types/express.types.js";
//import { GraphQLSchema, GraphQLObjectType, GraphQLString } from "graphql";
const s3WriteStream=promisify(pipeline);
const bootStrap=async():Promise<void>=>{
    const app:express.Express=express();
    app.use(cors(),express.json());
    /* const schema=new GraphQLSchema({
        query:new GraphQLObjectType({
            name:"RootQueryType",
            fields:{
                sayHi:{
                    type:GraphQLString,
                    resolve:()=>{
                        return "HELLO WORLD"
                    }
                }
            }
        })
    }) */
    app.all("/graphql",authentication(),createHandler({schema:schema,context:(req)=>({user:req.raw.user,decoded:req.raw.decoded})}))
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
    const httpServer:HttpServerType= app.listen(PORT,()=>{
        console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
    })

       realTimeGateway.initializeIo(httpServer);
    
    console.log("APPLICATION BOOTSTRAPED SUCCESSFULLY");
}
export default bootStrap;
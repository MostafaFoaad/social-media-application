import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client, type CompleteMultipartUploadCommandOutput, type DeleteObjectCommandInput, type DeleteObjectCommandOutput, type DeleteObjectsCommandOutput, type GetObjectCommandOutput, type ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { APPLICATION_NAME, AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_EXPIRES_IN, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "../../config/config.js";
import { randomUUID } from "node:crypto";
import { BadException } from "../exceptions/domain.exception.js";
import { createReadStream } from "node:fs";
import { StorageApproachEnum, UploadApproachEnum } from "../enums/multer.enum.js";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service{
    private client:S3Client;
    constructor(){
        this.client=new S3Client({
            region:AWS_REGION,
            credentials:{
                accessKeyId:AWS_ACCESS_KEY_ID,
                secretAccessKey:AWS_SECRET_ACCESS_KEY
            }
        })
    }

    async uploadAsset({
        storageApproach=StorageApproachEnum.DISK,
        Bucket=AWS_BUCKET_NAME,
        path="general",
        file,
        ACL=ObjectCannedACL.private,
        ContentType
    }:{
        storageApproach?:StorageApproachEnum
        Bucket?:string,
        path?:string,
        file:Express.Multer.File,
        ACL?:ObjectCannedACL,
        ContentType?:string|undefined
    }):Promise<string>  {
        const command=new PutObjectCommand({
            Bucket,
            Key:`${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
            ACL,
            Body:createReadStream(file.path),
            ContentType:file.mimetype||ContentType
        })
        if(!command.input?.Key){
            throw new BadException("FAIL TO UPLOAD THIS ASSET")
        }
        await this.client.send(command);

        return command.input?.Key
        }

        async uploadLargeAsset({
        storageApproach=StorageApproachEnum.DISK,
        Bucket=AWS_BUCKET_NAME,
        path="general",
        file,
        ACL=ObjectCannedACL.private,
        ContentType,
        partSize=5
    }:{
        storageApproach?:StorageApproachEnum
        Bucket?:string,
        path?:string,
        file:Express.Multer.File,
        ACL?:ObjectCannedACL,
        ContentType?:string|undefined,
        partSize?:number
    }):Promise<CompleteMultipartUploadCommandOutput>  {
        const uploadFile=new Upload({
            client:this.client,
            params:{
                Bucket,
                Key:`${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
                ACL,
                Body:createReadStream(file.path),
                ContentType:file.mimetype||ContentType
            },
            partSize:partSize*1024*1024
        })
        uploadFile.on("httpUploadProgress",(progress)=>{
            console.log(progress);
            console.log(`FILE UPLOAD IS ${((progress.loaded as number)/(progress.total as number))*100}%`)
        })
        return await uploadFile.done()

        }

        async uploadAssets({
        uploadApproach=UploadApproachEnum.SMALL,    
        storageApproach=StorageApproachEnum.DISK,
        Bucket=AWS_BUCKET_NAME,
        path="general",
        files,
        ACL=ObjectCannedACL.private,
        ContentType
        }:{
        uploadApproach?:UploadApproachEnum,    
        storageApproach?:StorageApproachEnum,
        Bucket?:string,
        path?:string,
        files:Express.Multer.File[],
        ACL?:ObjectCannedACL,
        ContentType?:string
        }):Promise<string[]>{
            let urls:string[]=[];
            if(uploadApproach===UploadApproachEnum.LARGE){
                const data= await Promise.all(
                files.map((file)=>{
                    return this.uploadLargeAsset({
                        storageApproach,
                        file,
                        ACL,
                        Bucket,
                        ContentType,
                        path,
                    })
                })
            )
            urls=data.map(ele=>ele.Key as string)
            }
            else{
                urls=await Promise.all(
                files.map((file)=>{
                    return this.uploadAsset({
                        storageApproach,
                        file,
                        ACL,
                        Bucket,
                        ContentType,
                        path,
                    })
                })
            )
            }
            
            
            return urls;
        }

        async createPreSignedUploadLink({
            Bucket=AWS_BUCKET_NAME,
            path="general",
            expiresIn=AWS_EXPIRES_IN,
            ContentType,
            originalName
        }:{
            Bucket?:string,
            path?:string,
            expiresIn?:number,
            ContentType:string,
            originalName:string
        }):Promise<{url:string,Key:string}>{
            const command=new PutObjectCommand({
            Bucket,
            Key:`${APPLICATION_NAME}/${path}/${randomUUID()}__${originalName}`,
            ContentType
        })
        if(!command.input?.Key){
            throw new BadException("FAIL TO UPLOAD THIS ASSET")
        }

        const url=await getSignedUrl(this.client,command,{expiresIn});
        return {url,Key:command.input.Key}
        }

        async getAsset({
        Bucket=AWS_BUCKET_NAME,
        Key
    }:{
        Bucket?:string,
        Key:string
    }):Promise<GetObjectCommandOutput>  {
        const command=new GetObjectCommand({
            Bucket,
            Key
        })
        return await this.client.send(command);
        }

        async getPreSignedUploadLink({
            Bucket=AWS_BUCKET_NAME,
            Key,
            expiresIn=AWS_EXPIRES_IN,
            fileName,
            download
            
        }:{
            Bucket?:string,
            Key:string,
            expiresIn?:number,
            fileName?:string,
            download?:string
        }):Promise<string>{
          const command=new GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition:download==="true"?`attachment; filename="${fileName||Key.split("/").pop()}"`:undefined
        })
        

        const url=await getSignedUrl(this.client,command,{expiresIn});
        return url;
        }

        async deleteAsset({
        Bucket=AWS_BUCKET_NAME,
        Key
    }:{
        Bucket?:string,
        Key:string
    }):Promise<DeleteObjectCommandOutput>  {
        const command=new DeleteObjectCommand({
            Bucket,
            Key
        })
        return await this.client.send(command);
        }

        async deleteAssets({
        Bucket=AWS_BUCKET_NAME,
        Keys
    }:{
        Bucket?:string,
        Keys:{Key:string}[]
    }):Promise<DeleteObjectsCommandOutput>  {
        const command=new DeleteObjectsCommand({
            Bucket,
            Delete:{
                Objects:Keys,
                Quiet:false
            }
        })
        return await this.client.send(command);
        }

        async listFolderDir({
        Bucket=AWS_BUCKET_NAME,
        prefix
    }:{
        Bucket?:string,
        prefix:string
    }):Promise<ListObjectsV2CommandOutput>  {
        const command=new ListObjectsV2Command({
            Bucket,
            Prefix:`${APPLICATION_NAME}/${prefix}`
        })
        return await this.client.send(command);
        }

        async deleteFolderByPrefix({
            Bucket=AWS_BUCKET_NAME,
            prefix
        }:{
             Bucket?:string,
             prefix:string
        }):Promise<DeleteObjectsCommandOutput>{
            const result=await this.listFolderDir({Bucket,prefix});
            const Keys=result.Contents?.map(ele=>{return {Key:ele.Key}}) as {Key:string}[];
            return await this.deleteAssets({Bucket,Keys});
        }
}

export const s3Service=new S3Service();
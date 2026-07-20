import type { AnyKeys, CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, PipelineStage, ProjectionType, QueryFilter, QueryOptions, ReturnsNewDoc, UpdateQuery } from "mongoose";
//import type { IUser } from "../../common/interfaces/user.interface.js";
import type { IPaginate } from "../../common/interfaces/pagination.interface.js";
import type { PopulateOptions } from "mongoose";

export class DatabaseRepository<TRowDoc>{
    constructor(protected readonly model:Model<TRowDoc>){}

    async create({
        data,
        options
    }:{
        data:AnyKeys<TRowDoc>[],
        options?:CreateOptions|undefined
    }):Promise<HydratedDocument<TRowDoc>[]>{
        return await this.model.create(data as any,options)
    }


    async createOne({
        data,
        options
    }:{
        data:AnyKeys<TRowDoc>,
        options?:CreateOptions|undefined
    }):Promise<HydratedDocument<TRowDoc>>{
        const[doc]=  await this.create({data:[data],options})
        return doc as HydratedDocument<TRowDoc>
    }

    async findOne({
        filter,
        projection,
        options
    }:{
        filter?:QueryFilter<TRowDoc>,
        projection?:ProjectionType<TRowDoc>|null|undefined,
        options?:QueryOptions<TRowDoc>&{lean?:false}|null|undefined

    }):Promise<HydratedDocument<TRowDoc>|null>

    async findOne({
        filter,
        projection,
        options
    }:{
        filter?:QueryFilter<TRowDoc>,
        projection?:ProjectionType<TRowDoc>|null|undefined,
        options?:QueryOptions<TRowDoc>&{lean?:true}|null|undefined

    }):Promise<null|FlattenMaps<TRowDoc>>

        async findOne({
        filter,
        projection,
        options
    }:{
        filter?:QueryFilter<TRowDoc>,
        projection?:ProjectionType<TRowDoc>|null|undefined,
        options?:QueryOptions<TRowDoc>|null|undefined

    }):Promise<any>{
        const doc=this.model.findOne(filter,projection)
        if(options?.populate) doc.populate(options.populate as PopulateOptions[])
        if(options?.lean) doc.lean(options.lean)
            return await doc.exec()
    }


       async find({
        filter,
        projection,
        options
    }:{
        filter?:QueryFilter<TRowDoc>,
        projection?:ProjectionType<TRowDoc>|null|undefined,
        options?:QueryOptions<TRowDoc>|null|undefined

    }):Promise<HydratedDocument<TRowDoc>[]>{
        const doc=this.model.find(filter,projection)
        if(options?.populate) doc.populate(options.populate as PopulateOptions[])
        if(options?.lean) doc.lean(options.lean)
        if(options?.skip) doc.skip(options.skip)
        if(options?.limit) doc.limit(options.limit)    
            return await doc.exec()
    }


    async paginate({
        filter,
        projection,
        options={},
        page=0,
        size=5
    }:{
        filter?:QueryFilter<TRowDoc>,
        projection?:ProjectionType<TRowDoc>|null|undefined,
        options?:QueryOptions<TRowDoc>,
        page?:number|string|undefined,
        size?:number|string|undefined,

    }):Promise<IPaginate<TRowDoc>>{
        let count:number=-1;
        if(Number(page)>0){
            page=parseInt(page as string);
            size=parseInt(size as string);
            options.skip=(page-1)*size;
            options.limit=size;
            count=await this.model.countDocuments({filter})
        }

        const docs=await this.find({filter:filter||{},projection,options})
        return {
            docs,
            ...(Number(page)>0?{
                currentPage:page,
                size,
                pages:Math.ceil(count/parseInt(size as string))
            }:{})
        }
    }


    async findOneAndUpdate({
        filter,
        update,
        options={new:true},
        populate=[]
    }:{
        filter:QueryFilter<TRowDoc>,
        update:UpdateQuery<TRowDoc>,
        options?:QueryOptions<TRowDoc>&ReturnsNewDoc,
        populate?:PopulateOptions[]
    }):Promise<HydratedDocument<TRowDoc>|null>{
        if(Array.isArray(update)){
            update.push({$set:{__v:{$add:["$__v",1]}}})
            return await this.model.findOneAndUpdate(filter,update,{...options,updatePipeline:true}).populate(populate)
        }
        return await this.model.findOneAndUpdate(filter,update,{...options,$incr:{__v:1}}).populate(populate)
    }


    async countDocuments({
        filter
    }:
    {
        filter?:QueryFilter<TRowDoc>
    }):Promise<number>{
        return await this.model.countDocuments(filter)
    }

    async aggregate<T>(
        Pipeline:PipelineStage[]
    ):Promise<T[]>{
        return await this.model.aggregate(Pipeline)
    }

    async deleteOne({
        filter
    }:{
        filter:QueryFilter<TRowDoc>,
    }):Promise<DeleteResult>{
        return await this.model.deleteOne(filter)
    }
}
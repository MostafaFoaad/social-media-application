import { model, Types} from "mongoose";
import { Schema } from "mongoose";
import type { IPost} from "../../common/interfaces/index.js";
import { AvailabilityEnum} from "../../common/enums/index.js";
import { ReactTypeEnum } from "../../common/enums/react.enum.js";


const postSchema=new Schema<IPost>({
    folderId:{type:String,required:true},

    content:{type:String,required:function(this){
        return this.attachments?.length}},

    attachments:{type:[String]},

    availability:{type:Number,enum:AvailabilityEnum,default:AvailabilityEnum.PUBLIC},

    likes:[{type:Types.ObjectId,ref:"User"}],

    reactions:[{
        userId:{type:Types.ObjectId, ref:"User", required:true},
        react:{type:String, enum:Object.values(ReactTypeEnum), required:true},
    }],

    tags:[{type:Types.ObjectId,ref:"User"}],

    updatedBy:[{type:Types.ObjectId,ref:"User"}],

    createdBy:[{type:Types.ObjectId,ref:"User",required:true}],

    deletedAt:{type:Date},

    restoredAt:{type:Date}
},
{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true},
    strict:true,
    strictQuery:true,
    collection:"SOCIAL_APP_POSTS"
})

postSchema.virtual("comments",{
    localField:"_id",
    foreignField:"postId",
    ref:"Comment",
    //justOne:true,
})


export const PostModel = model<IPost>("Post",postSchema);
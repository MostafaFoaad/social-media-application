import { model, Types, type HydratedDocument} from "mongoose";
import { Schema } from "mongoose";
import type { IStory, IStoryViews } from "../../common/interfaces/story.interface.js";


const storyViewsSchema=new Schema<IStoryViews>({
    user:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    viewedAt:{type:Date,default:Date.now}
})

const storySchema=new Schema<IStory>({
    owner:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{type:String},
    backgroundColor:{type:String,default:"#000"},
    attachmentUrl:{type:String},
    views:[storyViewsSchema],
    excludedUsers:[{type:Types.ObjectId,ref:"User"}],
    expiredAt:{type:Date,default:()=>new Date(Date.now()+24*60*60*1000)}
},
{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true},
    strict:true,
    strictQuery:true,
    collection:"SOCIAL_APP_STORIES"
})



storySchema.index({expiredAt:1},{expireAfterSeconds:0})
export const StoryModel = model<IStory>("Story",storySchema);
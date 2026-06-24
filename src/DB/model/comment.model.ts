import { model, Types} from "mongoose";
import { Schema } from "mongoose";
import type { IComment} from "../../common/interfaces/index.js";

const commentSchema=new Schema<IComment>({

    content:{type:String,required:function(this){
        return this.attachments?.length}},

    attachments:{type:[String]},

    likes:[{type:Types.ObjectId,ref:"User"}],

    tags:[{type:Types.ObjectId,ref:"User"}],

    postId:{type:Types.ObjectId,ref:"Post",required:true},

    commentId:{type:Types.ObjectId,ref:"Comment"},

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
    collection:"SOCIAL_APP_COMMENTS"
})

commentSchema.virtual("reply",{
    localField:"_id",
    foreignField:"commentId",
    ref:"Comment",
    justOne:true,
})




export const CommentModel = model<IComment>("Comment",commentSchema);
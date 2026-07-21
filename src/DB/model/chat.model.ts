import { model, Types} from "mongoose";
import { Schema } from "mongoose";
import type { IChat, IMessage} from "../../common/interfaces/index.js";
//import { AvailabilityEnum} from "../../common/enums/index.js";
import { ChatEnum } from "../../common/enums/chat.enum.js";

const messageSchema=new Schema<IMessage>({

    content:{
        type:String, required:function(this){
            return !this.attachments?.length
        }
    },
    attachments:{type:[String]},

    likes:{type:[{type:Types.ObjectId,ref:"User"}],default:[]},

    tags:[{type:Types.ObjectId,ref:"User"}],

    createdBy:{type:Types.ObjectId,ref:"User",required:true},

    deletedAt:{type:Date},

    restoredAt:{type:Date}
})
const chatSchema=new Schema<IChat>({
    
    participants:[{type:Types.ObjectId, ref:"User", required:true}],
    createdBy:{type:Types.ObjectId,ref:"User",required:true},
    type:{type:String,enum:ChatEnum,default:ChatEnum.ovo},
    group:{
        type:String, required:function(this){
            return this.type==ChatEnum.ovm
        }
    },
    roomId:{
        type:String, required:function(this){
            return this.type==ChatEnum.ovm
        }
    },
    group_image:{
        type:String
    },

    message:{type:[messageSchema],required:true},

     deletedAt:{type:Date},

    restoredAt:{type:Date}


},
{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true},
    strict:true,
    strictQuery:true,
    collection:"SOCIAL_APP_CHATS"
})




export const ChatModel = model<IChat>("Chat",chatSchema);
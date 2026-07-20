import { model, Types, type HydratedDocument} from "mongoose";
//import {models} from "mongoose";
import { Schema } from "mongoose";
import type { IUser } from "../../common/interfaces/index.js";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums/index.js";
import { generateHash } from "../../common/utils/security/hash.security.js";
import { generateEncryption } from "../../common/utils/security/encryption.security.js";



const userSchema=new Schema<IUser>({
    firstName:{type:String,required:true},

    lastName:{type:String,required:true},
    
    email:{type:String,required:true, unique:true},

    password:{type:String,required:function(this){
        return this.provider==ProviderEnum.SYSTEM}},

    phone:{type:String},

    profilePicture:{type:String},

    profileCoverPictures:{type:[String]},

    gender:{type:Number,enum:GenderEnum,default:GenderEnum.MALE},

    role:{type:Number,enum:RoleEnum,default:RoleEnum.USER},

    provider:{type:Number,enum:ProviderEnum,default:ProviderEnum.SYSTEM},

    changeCredentialsTime:{type:Date},

    friends:[{type:Types.ObjectId,ref:"User"}],

    DOB:{type:Date},
    
    confirmEmail:{type:Date},

    deletedAt:{type:Date},

    restoredAt:{type:Date},
},
{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true},
    strict:true,
    strictQuery:true,
    collection:"SOCIAL_APP_USERS"
})


userSchema.virtual("username").set(function(value:string){
    const [firstName,lastName]=value.split(" ")||[]
    this.firstName=firstName as string;
    this.lastName=lastName as string;
}).get(function(){
    return `${this.firstName} ${this.lastName}`
})

 userSchema.pre(["updateOne","findOneAndUpdate"],function(){
    const update=this.getUpdate() as HydratedDocument<IUser>;
    if(update.deletedAt){
        this.setUpdate({...update,$unset:{restoredAt:1}})
    }

    if(update.restoredAt){
        this.setUpdate({...update,$unset:{deletedAt:1}})
        this.setQuery({...this.getQuery(),deletedAt:{$exists:true}})
    }
    const query=this.getQuery();
    if(query.paranoid===false){
        this.setQuery({...query})
    }

    else{
        this.setQuery({deletedAt:{$exists:false},...query})
    }
    //console.log(this.getQuery())
})

userSchema.pre(["deleteOne","findOneAndDelete"],function(){
    
    const query=this.getQuery();
    if(query.force===true){
        this.setQuery({...query})
    }

    else{
        this.setQuery({deletedAt:{$exists:true},...query})
    }
    //console.log(this.getQuery())
})


userSchema.pre("save",async function(this:HydratedDocument<IUser>&{wasNew:boolean}) {
    this.wasNew=this.isNew
    console.log("pre one",this);
    console.log(this.isNew)
    if(this.isModified("password")){
        this.password=await generateHash({plaintext:this.password})
    }

    if(this.phone && this.isModified("phone")){
        this.phone=await generateEncryption(this.phone)
    }
})

userSchema.post("save",async function(){
    const that=this as HydratedDocument<IUser>&{wasNew:boolean};
    console.log({post:that.wasNew})
})


export const UserModel = model<IUser>("User",userSchema);
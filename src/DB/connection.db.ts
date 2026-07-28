import { connect } from "mongoose"
import { DB_URI } from "../config/config.js"

const connectDB=async()=>{
    try{
        await connect(DB_URI,{serverSelectionTimeoutMS:30000});
        console.log(`THE DB CONNECTED SUCCESSFULLY`)
    }
    catch(error){
        console.log(`FAIL TO CONNECT TO DB`)
    }
}

export default connectDB;
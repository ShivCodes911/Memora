import mongoose from "mongoose";

interface userSchemaBody{
    username:string,
    password:string
}

const userSchema = new mongoose.Schema <userSchemaBody>({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true}
});

const userModel=mongoose.model("User",userSchema);

export default userModel;
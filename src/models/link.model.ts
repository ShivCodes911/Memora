import mongoose from "mongoose";

interface linkSchemaBody{
    hash:string;
    userId:mongoose.Types.ObjectId;
};

const linkSchema=new mongoose.Schema<linkSchemaBody>({
    hash:{type:String,required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}

});

const linkModel=mongoose.model("Link",linkSchema);

export default linkModel;
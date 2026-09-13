import mongoose from "mongoose";

interface contentSchemaBody {
    link:string;
    type:string | Enumerator;
    title:string;
    tags:mongoose.Types.ObjectId[];
    userId:mongoose.Types.ObjectId;
};

const contentType=['image','video','article','audio'];


const contentSchema=new mongoose.Schema <contentSchemaBody> ({
    link:{type:String,required:true,unique:true},
    type:{type:String,enum:contentType,required:true},
    title:{type:String,required:true},
    tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}],
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
});

const contentModel=mongoose.model("Content",contentSchema);

export default contentModel;
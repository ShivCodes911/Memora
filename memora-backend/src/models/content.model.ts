import mongoose from "mongoose"

interface contentSchemaBody {
    link:string;
    type:string;
    title:string;
    description?:string;
    tags:mongoose.Types.ObjectId[];
    userId:mongoose.Types.ObjectId;
    collectionId:mongoose.Types.ObjectId | null;
};

const contentType = ["youtube", "twitter", "image", "video", "article", "audio", "pdf", "shared_brain"];


const contentSchema=new mongoose.Schema <contentSchemaBody> ({
    link:{type:String,required:true},
    type:{type:String,enum:contentType,required:true},
    title:{type:String,required:true},
    description:{type:String,default:""},
    tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}],
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    collectionId:{type:mongoose.Schema.Types.ObjectId,ref:"Collection",default:null}
});

// same user can't save the same link twice in the same place (same collection, or twice in "All content")
contentSchema.index({userId:1,link:1,collectionId:1},{unique:true});
const contentModel=mongoose.model("Content",contentSchema);

export default contentModel;
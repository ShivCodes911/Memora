import mongoose from "mongoose";

interface tagSchemaBody{
    title:string
};

const tagSchema = new mongoose.Schema<tagSchemaBody> ({
    title:{type:String,required:true,unique:true}
});

const tagModel=mongoose.model("Tag",tagSchema);

export default tagModel;
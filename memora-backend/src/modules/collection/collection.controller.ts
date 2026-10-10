import type {Request,Response} from "express";
import collectionModel from "../../models/collection.model.js";



//creating new collection
export const createCollection=async(req:Request,res:Response)=>{
    try {
        const userId=req.userId;

        if(!userId){
            return res.status(401).json({
                message:"user Unauthorized"
            })
        };

        const {title,icon}=req.body;

       if(typeof title!=="string" || !title.trim()){
            return res.status(400).json({
                message:"Title is required"
            })
        };

        const collection=await collectionModel.create({
            title:title.trim(),
            icon,
            userId
        });

        return res.status(201).json({
            message:"Collection Created !",
            collection:collection
        });
    } catch (error) {
    console.error("createCollection failed",error);
    return res.status(500).json({
        message:"Internal server error"
    });
}
};

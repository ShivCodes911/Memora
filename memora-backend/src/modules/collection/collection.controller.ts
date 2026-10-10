import type {Request,Response} from "express";
import mongoose from "mongoose";
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

// fetching the collection
export const getCollection=async(req:Request,res:Response)=>{
    try {

        const userId=req.userId;

        if(!userId){
            return res.status(401).json({
                message:"Unauthorized user !"
            })
        };

        const collection=await collectionModel.find({userId}).sort({createdAt:-1})

        // createdAt: -1 puts the newest collection at the top of the sidebar, and 1 puts the oldest first

        return res.status(200).json({
            message:"Collection Fetched !",
            data:{
                collection
            }
        });
    }catch (error) {
    console.error("fetching collection failed",error);
    return res.status(500).json({
        message:"Internal server error"
    });
}
};

export const updateCollection =async(req:Request,res:Response)=>{
    try {

        const userId=req.userId;

        if(!userId){
            return res.status(401).json({
                message:"user is Unauthorized"
            })
        }

        const id=req.params.id;

        const {title,icon}=req.body;

        if(!id || !mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"provides Params Id is Incorrect"
            })
        }

    if(title===undefined && icon===undefined){
        return res.status(400).json({
            message:"Nothing is updated"
        }) // "Nothing to update"
    }
    if(title!==undefined && (typeof title!=="string" || !title.trim())){
        return  res.status(400).json({
            message:"Title must be a non-empty string"
        })  
    }
    if(icon!==undefined && typeof icon!=="string"){
        return  res.status(400).json({
            message:"Icon must be a string"
        }) 
    }

        const collection = await collectionModel.findOne({_id:id ,userId:userId});

        if(!collection){
            return res.status(404).json({
                message:"collection not found !"
            })
        };

        
        if(title!==undefined) collection.title=title.trim();
        if(icon!==undefined)  collection.icon=icon;

       await collection.save();  

       return res.status(200).json({
        message:"Collection updated Successfully !!",
        updatedCollection:{
            collection
        }
       })
    } catch (error) {
        console.error("updateCollection failed",error);
    return res.status(500).json({
        message:"Internal server error"
    });

        
    }
}






import contentModel from "../../models/content.model.js";

import type{Request,Response} from "express";

export const addContent=async(req:Request,res:Response)=>{
    try {
        const {link,type,title,tags}=req.body;
        const userId=req.userId

        if(!userId){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }

       const content=await contentModel.create({
            link,
            type,
            title,
            tags:[],
            userId:userId
        });

        return res.status(201).json({
            message:"Content created SuccessFully",
            content
        });
    } catch (error) {
        console.error("failed",error);
        
    }

};



export const fetchContent=async(req:Request,res:Response)=>{
    try {
        const userId=req.userId;
        if(!userId){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }
        const content=await contentModel.find({
            userId:userId
    }).populate("userId","username");

    return res.status(200).json({
        message:"Here is your content",
        content:content
    })

    
} catch (error) {
        console.error("failed",error);
        
    }

};
export const deleteContent=async(req:Request,res:Response)=>{
    try {

        

        
    } catch (error) {
        console.error("failed",error);
        
    }

};
export const shareContent=async(req:Request,res:Response)=>{
    try {

        

        
    } catch (error) {
        console.error("failed",error);
        
    }

};
export const fetchSharedContent=async(req:Request,res:Response)=>{
    try {

        

        
    } catch (error) {
        console.error("failed",error);
        
    }

};
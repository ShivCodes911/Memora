
import contentModel from "../../models/content.model.js";

import type{Request,Response} from "express";
import linkModel from "../../models/link.model.js";
import { hash } from "../../utils/hashingLink.util.js";
import userModel from "../../models/user.model.js";

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

        const userId=req.userId;
        const contentId=req.params.contentId;

        if(!userId){
            return res.status(400).json({
                message:"Unauthorized"
            })
        };

        const deletedContent= await contentModel.deleteOne({
            _id:contentId,
            userId,
            
        });


        return res.status(200).json({
            message:"Content Deleted Successfully",
            deleteContent:deletedContent
        });
     } catch (error) {
        return res.status(500).json({
            message:`Internal Server Error${error}`
        })
        
    }

};

export const shareContent=async(req:Request,res:Response)=>{
    try {
        const {share}=req.body;

        const userId=req.userId

        if(!userId){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }
        const shareHash=hash(10);

        if(share){
           const link=await linkModel.create({
                hash:shareHash,
                userId
            })
        }
        else{
            await linkModel.deleteOne({
                userId
            })
        }

        return res.status(201).json({
            message:"Link Created SuccessFully",
           
        })

        

        
    } catch (error) {
        console.error("failed",error);
        
    }

};


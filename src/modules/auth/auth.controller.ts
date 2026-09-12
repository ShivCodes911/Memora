
import userModel from "../../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

import type{ Request, Response } from "express";


export const signup=async(req:Request,res:Response)=>{
    try {

        const {username,password} =req.body;

        const existingUser=await userModel.findOne({username});
        if(existingUser){
            return res.status(403).json({
                message:"user already exists"
            }) 
        }


        const hashPassword= await bcrypt.hash(password,10);

        const user=await userModel.create({
            username:username,
            password:hashPassword
        });

        return res.status(200).json({
            message:"User created Successfully",
            user
        });
    
    } catch (error) {
        return res.status(500).json({
            message:`SERVER FAILED :- ${console.error(error)}`
        });
    }

};


export const signin=async(req:Request,res:Response)=>{
    try {
        const {username,password}=req.body;
        
        const existingUser= await userModel.findOne({
            username
            
        });
        

        if(!existingUser){
            return res.status(404).json({
                message:"User not found"
            })
        };

        const matchedPassword=await bcrypt.compare(password,existingUser.password);

        if(!matchedPassword){
            return res.status(403).json({
                message:"invalid password"
            })
        }

        const token=jwt.sign({id:existingUser._id},process.env.JWT_SECRET!);

        return res.status(200).json({
            message:"User signed in Successfully!!!",
            token:token,
        })
    } catch (error) {
         return res.status(500).json({
            message:`SERVER FAILED :- ${console.error(error)}`
        });
        
    }

};

export const content=async(req:Request,res:Response)=>{
    try {

        

        
    } catch (error) {
        console.error("failed",error);
        
    }

};

export const fetchContent=async(req:Request,res:Response)=>{
    try {

        

        
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
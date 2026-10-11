import type {Request,Response} from "express";
import mongoose from "mongoose";
import collectionModel from "../../models/collection.model.js";
import contentModel from "../../models/content.model.js";
import { hash } from "../../utils/hashingLink.util.js";
import userModel from "../../models/user.model.js";



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
};


export const deleteCollection=async(req:Request,res:Response)=>{
    try {
        const userId=req.userId;

        if(!userId){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }

        const id = req.params.id;

        if(!id  || !mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"Provide valid Collection ID"
            })
        };

        const collection = await collectionModel.findOne({_id:id,userId});

        if(!collection){
            return res.status(404).json({
                message:"collection not found"
            })
        };

        await contentModel.updateMany({
            collectionId:id,
            userId
        },{
            $set:{collectionId:null}
        });

        await collectionModel.deleteOne({_id:id,userId});

        return res.status(200).json({
            message:"Collection deleted Successfully"
        })

    } catch (error) {
        console.error("deleteCollection failed",error);
        return res.status(500).json({
        message:"Internal server error"
    });
        
    }

};



export const shareCollection=async(req:Request,res:Response)=>{
    try {

        const userId=req.userId;

        if(!userId){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }

        const id =req.params.id;

        if(!id || !mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"Provide params id is not valid"
            })
        };

        const {share}=req.body;

        if(typeof share !== "boolean"){
            return res.status(400).json({
                message:"share must be in Boolean state either true or false"
            })
        };

        const collection = await collectionModel.findOne({_id:id,userId});

        if(!collection){
            return res.status(404).json({
                message:"Collection Not Found !!"
            })
        };

        if(share===true){
            if(!collection.shareHash){
                collection.shareHash=hash(10);
                await collection.save();
            }

        return res.status(200).json({
            message:  "Shared Link is Ready",
            link: "/share/c/" + collection.shareHash 
        });
        }
        
        await collectionModel.updateOne({_id:id,userId} ,
            {$unset:{
                shareHash:""
        }});

        return res.status(200).json(
            {
                message:"Sharing turned off"
            }
        )
        
    } catch (error) {
         console.error("shareCollection failed",error);
        return res.status(500).json({
        message:"Internal server error"
    });
        
    }
};



export const getSharedCollection=async(req:Request,res:Response)=>{
    try {
        const shareHash=req.params.shareHash;

        if(!shareHash){
            return res.status(400).json({
                message:"provide valide Link"
            })
        };

        const collection = await collectionModel.findOne({shareHash});

        if(!collection){
            return res.status(404).json({
                message:"Collection not Found"
            })
        };

        const content=await contentModel.find({collectionId:collection._id,userId:collection.userId});
        const user=await userModel.findById(collection.userId).select("username");

        if(!user){
            return res.status(404).json({
                message:"Owner not Found"
            })
        };

        
        return res.status(200).json({
    message:"collection Fetched !!",
    data:{
        username:user.username,
        collection:{
            title:collection.title,
            icon:collection.icon
        },
        content
    }
    })

}
 catch (error) {
          console.error("shareCollection failed",error);
        return res.status(500).json({
        message:"Internal server error"
    });

        
    }
}

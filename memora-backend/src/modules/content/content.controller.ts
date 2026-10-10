import mongoose from "mongoose";
import contentModel from "../../models/content.model.js";
import collectionModel from "../../models/collection.model.js";

import type{Request,Response} from "express";
import linkModel from "../../models/link.model.js";
import { hash } from "../../utils/hashingLink.util.js";
import userModel from "../../models/user.model.js";

export const addContent=async(req:Request,res:Response)=>{
    try {
        const {link,type,title,description,tags}=req.body;
        const userId=req.userId

        if(!userId){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }

        if(!link || !type || !title){
            return res.status(400).json({
                message:"Link, type, and title are required."
            })
        }

       const content=await contentModel.create({
            link,
            type,
            title,
            description: description || "",
            tags:tags || [],
            userId:userId
        });

        return res.status(201).json({
            message:"Content created SuccessFully",
            content
        });
    } catch (error: any) {
        console.error("Failed to add content:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: "You have already saved this link to your vault."
            });
        }
        return res.status(500).json({
            message: error.message || "Failed to create content"
        });
    }
};

// updating the content (title, description, or which collection it is in)
export const updateContent=async(req:Request,res:Response)=>{
    try {
        const userId=req.userId;
        const contentId=req.params.contentId;
        const {title,description,collectionId}=req.body;

        if(!userId){
            return res.status(401).json({
                message:"Unauthorized"
            })
        };

        if(!contentId || !mongoose.isValidObjectId(contentId)){
            return res.status(400).json({
                message:"Provide valid Content ID"
            })
        };

        // only the fields that are sent go in here
        const update:{title?:string; description?:string; collectionId?:string|null}={};

        if(title!==undefined){
            if(typeof title!=="string" || !title.trim()){
                return res.status(400).json({
                    message:"Title must be a non-empty string"
                })
            };
            update.title=title.trim();
        };

        if(description!==undefined){
            if(typeof description!=="string"){
                return res.status(400).json({
                    message:"Description must be a string"
                })
            };
            update.description=description;
        };

        // null -> move back to "All content", string -> move into that collection
        if(collectionId!==undefined){
            if(collectionId!==null){
                if(typeof collectionId!=="string" || !mongoose.isValidObjectId(collectionId)){
                    return res.status(400).json({
                        message:"Provide valid Collection ID"
                    })
                };

                const collectionExists=await collectionModel.exists({_id:collectionId,userId});

                if(!collectionExists){
                    return res.status(404).json({
                        message:"collection not found"
                    })
                };
            };
            update.collectionId=collectionId;
        };

        if(Object.keys(update).length===0){
            return res.status(400).json({
                message:"Nothing to update"
            })
        };

        const content=await contentModel.findOneAndUpdate(
            {_id:contentId,userId},
            {$set:update},
            {returnDocument:"after",runValidators:true}
        );

        if(!content){
            return res.status(404).json({
                message:"content not found"
            })
        };

        return res.status(200).json({
            message:"Content updated Successfully",
            content
        })
    } catch (error) {
        // same link already saved in the collection it is being moved into (unique index on userId + link + collectionId)
        if(error instanceof mongoose.mongo.MongoServerError && error.code===11000){
            return res.status(409).json({
                message:"This link is already saved in that collection"
            })
        };
        console.error("updateContent failed",error);
        return res.status(500).json({
            message:"Internal server error"
        });
    }
};

// diaplays the added content on the screen 

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
    } catch (error: any) {
        console.error("Failed to fetch content:", error);
        return res.status(500).json({
            message: error.message || "Failed to fetch content"
        });
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

        const existingLink=await linkModel.findOne({
            userId:req.userId!,
        })

        // user can not share multiple links so , that is why , 

        if(existingLink){
            return res.status(200).json({
                message:"here is your Link",
                link:`/share/${existingLink.hash}`
            })
        }
        const {share}:{share:boolean}=req.body;

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

            return res.status(201).json({
                message: "Share link created successfully",
                link: `/share/${link.hash}`
            });
        }
        else{
            await linkModel.deleteOne({
                userId
            })
            return res.status(201).json({
            message:"removed link",
           
        })
        }
    } catch (error) {
        console.error("failed",error);

        return res.status(500).json({
            message: "Internal server error"
        });
        
    }

};

export const fetchSharedContent=async(req:Request,res:Response)=>{
    try {
        const hash=req.params.shareLink!;

        

        const link=await linkModel.findOne({
            hash
         });
         

            if(!link){
               return res.status(401).json({
                    message:"incorrect Input"
                })
            };
            

            // now we have got the link , now i want the load the content of the user 
            //for other users


            const content= await contentModel.find({
                userId:link.userId
            });

            

            // i also want user Info;

            const user=await userModel.findOne({
                _id:link.userId
            });

            

            if(!user){
                return res.status(401).json({
                    message:"User not Found"
                })
            }
            return res.json({
                username:user.username,
                content:content
            })
} catch (error) {
        console.error("failed",error);
           return res.status(500).json({
            message: "Internal server error"
        });
        
    }

};
/*-----------------------------------------------------------------------------------*/

// from here rohit PR logic begins

export const fetchMetadata = async (req: Request, res: Response) => {
    try {
        const urlStr = req.query.url as string;
        if (!urlStr) {
            return res.status(400).json({ message: "URL is required" });
        }

        const targetUrl = urlStr.startsWith("http") ? urlStr : `https://${urlStr}`;
        const parsedUrl = new URL(targetUrl);
        const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;

        // Check if URL is a direct PDF link
        const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
        const lastSegment = pathParts[pathParts.length - 1] || "";
        const isPdfUrl = targetUrl.toLowerCase().includes(".pdf") || lastSegment.toLowerCase().endsWith(".pdf");

        if (isPdfUrl) {
            const cleanName = lastSegment ? decodeURIComponent(lastSegment) : `PDF Document (${parsedUrl.hostname})`;
            return res.status(200).json({
                title: cleanName,
                description: "PDF Document",
                image: "",
                favicon,
                domain: parsedUrl.hostname
            });
        }

        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.8,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5"
            },
            redirect: "follow",
            signal: AbortSignal.timeout(8000)
        });

        const contentTypeHeader = response.headers.get("content-type") || "";
        if (contentTypeHeader.includes("application/pdf")) {
            const cleanName = lastSegment ? decodeURIComponent(lastSegment) : `PDF Document (${parsedUrl.hostname})`;
            return res.status(200).json({
                title: cleanName,
                description: "PDF Document",
                image: "",
                favicon,
                domain: parsedUrl.hostname
            });
        }

        const html = await response.text();

        // Helper: extract meta tag content (handles both property and name, and both attribute orderings)
        const getMetaContent = (property: string): string | null => {
            const p1 = new RegExp(`<meta[^>]*?(?:property|name)\\s*=\\s*["']${property}["'][^>]*?content\\s*=\\s*["']([^"']+)["']`, 'i');
            const p2 = new RegExp(`<meta[^>]*?content\\s*=\\s*["']([^"']+)["'][^>]*?(?:property|name)\\s*=\\s*["']${property}["']`, 'i');
            const match = html.match(p1) || html.match(p2);
            return (match && match[1]) ? match[1].trim() : null;
        };

        // Title extraction: try OG, then twitter, then <title> tag
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const rawTitle = getMetaContent("og:title") 
            || getMetaContent("twitter:title") 
            || (titleMatch && titleMatch[1] ? titleMatch[1].replace(/\s+/g, ' ').trim() : null);
        
        const title = rawTitle 
            ? rawTitle.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'") 
            : (lastSegment || parsedUrl.hostname);
        
        const description = getMetaContent("og:description") || getMetaContent("twitter:description") || getMetaContent("description") || "";

        // Image: resolve relative URLs to absolute
        let image = getMetaContent("og:image") || getMetaContent("twitter:image") || getMetaContent("twitter:image:src") || "";
        if (image && !image.startsWith("http")) {
            if (image.startsWith("//")) {
                image = `https:${image}`;
            } else {
                image = new URL(image, targetUrl).href;
            }
        }

        return res.status(200).json({
            title,
            description: description.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
            image,
            favicon,
            domain: parsedUrl.hostname
        });
    } catch (error) {
        console.error("Fetch metadata error:", error);
        const fallbackDomain = (() => {
            try { return new URL(req.query.url as string).hostname; } catch { return ""; }
        })();
        const fallbackPath = (() => {
            try { 
                const p = new URL(req.query.url as string).pathname.split("/").filter(Boolean);
                return p[p.length - 1] || "";
            } catch { return ""; }
        })();
        return res.status(200).json({
            title: fallbackPath ? decodeURIComponent(fallbackPath) : (fallbackDomain || "Saved PDF / Link"),
            description: "PDF Document",
            image: "",
            favicon: fallbackDomain ? `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=64` : "",
            domain: fallbackDomain
        });
    }
};


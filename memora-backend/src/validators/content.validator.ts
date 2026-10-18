import { z } from "zod";
import mongoose from "mongoose";
import { contentType } from "../models/content.model.js";

// addContent: link is checked again by toWebLink in the handler
export const addContentSchema=z.object({
    link:z.string({error:"Link is required"}),
    type:z.enum(contentType,{error:"Type must be one of: "+contentType.join(", ")}),
    title:z.string({error:"Title is required"})
        .trim()
        .min(1,{error:"Title is required"})
        .max(200,{error:"Title must be at most 200 characters"}),
    description:z.string({error:"Description must be text"})
        .trim()
        .max(5000,{error:"Description must be at most 5000 characters"})
        .default(""),
    collectionId:z.string({error:"Enter valid CollectionID"})
        .refine((id)=>mongoose.isValidObjectId(id),{error:"Enter valid CollectionID"})
        .nullable()
        .default(null)
},{error:"Request body must be a JSON object"});

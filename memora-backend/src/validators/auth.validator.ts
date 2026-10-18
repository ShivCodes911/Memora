import { z } from "zod";

// signup: strict rules, because this creates the account
export const signupSchema=z.object({
    username:z.string({error:"Username is required"})
        .trim()
        .regex(/^[a-zA-Z0-9_]{3,30}$/,{error:"Username must be 3-30 characters: letters, numbers or _"}),
    password:z.string({error:"Password is required"})
        .min(8,{error:"Password must be at least 8 characters"})
        .max(72,{error:"Password must be at most 72 characters"})
},{error:"Request body must be a JSON object"});

// signin: only "non-empty strings", so old accounts can still log in
export const signinSchema=z.object({
    username:z.string({error:"Username is required"})
        .trim()
        .min(1,{error:"Username is required"}),
    password:z.string({error:"Password is required"})
        .min(1,{error:"Password is required"})
},{error:"Request body must be a JSON object"});

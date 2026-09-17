import type { Request,Response,NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";



export const authMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    try {
        const authToken=req.headers.authorization;

    if(!authToken || !authToken.startsWith("Bearer ") ){
        return res.status(400).json({
            message:"Unauthorized"
        });

    }

    const token=authToken.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }

    const decodedToken=jwt.verify(token!,process.env.JWT_SECRET!) as {id:string};

    if(!decodedToken){
      res.status(400).json({
            message:"User is not authorized"
        })
    };

    req.userId=decodedToken.id;
    next();

        
    } catch (error) {
        return res.status(401).json({
            message:"invalid token"
        })
        
    }


}
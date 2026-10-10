import express from "express";


import { createCollection } from "./collection.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";




const router=express.Router();


router.post("/",authMiddleware,createCollection);

export default router;



import express from "express";


import { createCollection, getCollection } from "./collection.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";




const router=express.Router();


router.post("/",authMiddleware,createCollection);
router.get("/",authMiddleware,getCollection);

export default router;



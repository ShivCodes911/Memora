import express from "express";


import { createCollection, getCollection, updateCollection } from "./collection.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";




const router=express.Router();


router.post("/",authMiddleware,createCollection);
router.get("/",authMiddleware,getCollection);
router.patch("/:id",authMiddleware,updateCollection);

export default router;



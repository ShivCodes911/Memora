import express from "express";


import { createCollection, deleteCollection, getCollection, shareCollection, updateCollection } from "./collection.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";




const router=express.Router();


router.post("/",authMiddleware,createCollection);
router.get("/",authMiddleware,getCollection);
router.patch("/:id",authMiddleware,updateCollection);
router.delete("/:id",authMiddleware,deleteCollection);
router.post("/:id/share",authMiddleware,shareCollection);


export default router;



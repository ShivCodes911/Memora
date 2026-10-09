import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

import { addContent, deleteContent, fetchContent, fetchMetadata, fetchSharedContent, shareContent, updateContent } from "./content.controller.js";

const router=express.Router();

router.post("/",authMiddleware,addContent);
router.get("/",authMiddleware,fetchContent);
router.put("/:contentId",authMiddleware,updateContent);
router.patch("/:contentId",authMiddleware,updateContent);
router.get("/preview/metadata",authMiddleware,fetchMetadata);
router.delete("/:contentId",authMiddleware,deleteContent);
router.post("/share",authMiddleware,shareContent);
router.get("/:shareLink",fetchSharedContent);

export default router;
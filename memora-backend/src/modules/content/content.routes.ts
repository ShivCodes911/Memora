import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

import { addContent, deleteContent, fetchContent, fetchSharedContent, shareContent} from "./content.controller.js";

const router=express.Router();

router.post("/",authMiddleware,addContent);
router.get("/",authMiddleware,fetchContent);
router.delete("/:contentId",authMiddleware,deleteContent);
router.post("/share",authMiddleware,shareContent);
router.get("/:shareLink",fetchSharedContent);

export default router;
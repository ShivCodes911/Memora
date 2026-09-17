import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

import { addContent, deleteContent, fetchContent} from "./content.controller.js";

const router=express.Router();

router.post("/",authMiddleware,addContent);
router.get("/",authMiddleware,fetchContent);
router.delete("/:contentId",authMiddleware,deleteContent);

export default router;
import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

import { addContent} from "./content.controller.js";

const router=express.Router();

router.post("/",authMiddleware,addContent);

export default router;
import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";


import {getProfile, signin, signup} from "./auth.controller.js"

const router=express.Router();

router.post("/signup",signup);
router.post("/signin",signin);
router.get("/me",authMiddleware,getProfile);


export default router;
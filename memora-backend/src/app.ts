 import express from "express";
 import cors from "cors";

 import authRouter from "./modules/auth/auth.routes.js"
 import contentRouter from "./modules/content/content.routes.js"
 const app = express();

 app.use(express.json());
 app.use(cors());

 app.use("/api/v1/auth",authRouter);
 app.use("/api/v1/content",contentRouter);

 export default app;


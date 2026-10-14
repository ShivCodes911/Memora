import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.config.js";

const PORT = Number(process.env.PORT) || 3000;


connectDB()
.then(()=>{
    app.listen(PORT,()=>{
    console.log(`Server is listening on PORT ${PORT}`)
})
})
.catch((error)=>{
    console.error("DB connection failed",error);
    process.exit(1);
})




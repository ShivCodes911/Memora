import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.config.js";

dotenv.config();

const PORT =Number(process.env.PORT) ||3000;


connectDB()
.then(()=>{
    app.listen(PORT,()=>{
    console.log("Server is listening on PORT 3000")
})
})
.catch((error)=>{
    console.error("DB connection failed",error);
    process.exit(1);
})




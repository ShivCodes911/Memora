import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        if(!process.env.MONGO_URI){
            throw new Error("provide the env variable");
        }

        const connectInstance=await mongoose.connect(process.env.MONGO_URI);
        console.log(`connected susscessfully ✅:${connectInstance.connection.host}`)

        
    } catch (error) {
        console.error("Failed to connect,error");
        process.exit(1);
        
    }
};

export default connectDB;
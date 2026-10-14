import mongoose from "mongoose";

interface collectionBodySchema {
    title: string;
    icon: string;
    userId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId | null;
    shareHash?: string;
}

const collectionSchema = new mongoose.Schema<collectionBodySchema>({
    title: { type: String, required: true },
    icon: { type: String, default: "📁" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", default: null },
    shareHash: { type: String, unique: true, sparse: true }
},
{
    timestamps: true
});


const collectionModel = mongoose.model("Collection",collectionSchema);

export default collectionModel;
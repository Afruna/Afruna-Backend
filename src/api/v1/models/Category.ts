import { Document, Schema, model } from "mongoose";

export interface CategoryInterface extends Document {
    name: string;
    cover: string;
    type: "product" | "service" | "other";
}

const schema = new Schema<CategoryInterface>({
    name: String,
    cover: String,
    type: {
        type: String,
        enum: ["product", "service", "other"],
        default: "product",
    }
}, { timestamps: true }
);

const Category = model('Category2', schema);

export default Category;
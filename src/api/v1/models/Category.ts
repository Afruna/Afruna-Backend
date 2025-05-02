import { Document, Schema, model } from "mongoose";

export interface CategoryInterface extends Document {
    name: string;
    cover: string;
}

const schema = new Schema<CategoryInterface>({
    name: String,
    cover: String,
}, { timestamps: true }
);

const Category = model('Category', schema);
export default Category;
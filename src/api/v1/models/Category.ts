import { Document, Schema, model, Types } from "mongoose";

export interface CategoryInterface extends Document {
    name: string;
    cover: string;
    type: "product" | "service" | "other";
    parent?: Types.ObjectId;
    children?: Types.ObjectId[];
}

const schema = new Schema<CategoryInterface>({
    name: String,
    cover: String,
    type: {
        type: String,
        enum: ["product", "service", "other"],
        default: "product",
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Category2',
        default: null,
    },
    children: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Category2',
        }
    ],
}, { timestamps: true }
);

const Category = model('Category2', schema);

export default Category;
import { InputType, ProductSpecInterface } from "@interfaces/Product.Spec.Interface";
import { Schema } from "mongoose";

export const ProductSpecSchema = new Schema<ProductSpecInterface>({
    name: String,
    label: String,
    inputType: { type: String, enum: Object.values(InputType), default: InputType.TEXT },
    metadata: Schema.Types.Mixed
},
{ timestamps: true }
);
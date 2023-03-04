import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    productName: { type: String, required: true, trim: true },
    sellerId: {type: Schema.Types.ObjectId, ref:"User"},
    description: { type: String, required: true },
    category: { type: String, enum: ["TECHNOLOGY", "CLOTHES", "HOUSE"]},
    price: { type: Number, required: true,  min: 0},
    image: {type: String},
    quantity: {type: Number,  min: 0 },
    isUsed: { type: Boolean }
  },
  { timestamps: true }
);

export const ProductModel = model("Product", productSchema); 
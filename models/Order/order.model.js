import { Schema, model, Types } from "mongoose";

const orderSchema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User"},
    buyerId: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["SHIPPING", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"],
      default: "SHIPPING",
    },
    shipppingAdress: { type: String },
    receiveAdress: { type: String },
    payment: {
      type: String,
      enum: ["PIX", "CREDIT", "VISA", "CASH PAYMENT"],
      required: true,
    },
    orderProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    totalPrice: { type: Number },
    quantity: { type: Number },
  },
  { timestamps: true }
);

export const OrderModel = model("Order", orderSchema);

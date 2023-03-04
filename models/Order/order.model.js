import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    buyerId: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["SHIPPING", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"],
    },
    shipppingAdress: { type: String },
    receiveAdress: { type: String },
    payment: {
      type: String,
      enum: ["PIX", "CREDIT", "VISA", "CASH PAYMENT"],
      required: true,
    },
    orderProducts: [],
    totalPrice: { type: Number },
  },
  { timestamps: true }
);

export const OrderModel = model("Order", orderSchema);

import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    CEP: { type: String, required: true },
    state: { type: String },
    city: { type: String },
    street: { type: String, required: true },
    houseNumber: { type: Number, required: true },
    apartmentNumber: { type: Number },
    neighborhood: { type: String },
    image: {type: String}
  },
  { timestamps: true }
);

export const UserModel = model("User", userSchema);

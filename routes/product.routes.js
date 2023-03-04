import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import { ProductModel } from "../models/Product/product.model.js";
import { UserModel } from "../models/User/user.model.js";

const productRouter = express.Router();

productRouter.post("/", isAuth, attachCurrentUser, async (req, res) => {
  try {

    const newProduct = await ProductModel.create({
      ...req.body,
      sellerId: req.currentUser._id,


    await UserModel.findOneAndUpdate(
      { _id: req.currentUser._id },
      { $push: { products: newProduct._id } },
      { new: true, runValidators: true }
    );

    return res.status(201).json(newProduct);
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((value) => value.message);
      return res.status(400).json({
        err: message,
      });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

productRouter.put("/:productId",isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { productId } = req.params;
    if(!req.currentUser.products.includes(req.params.productId)){
      return res.status(401).json("Você não tem permissão de fazer isso.");
    }

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: productId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    await UserModel.findOneAndUpdate(
      { _id: productId },
      { $push: { products: updatedProduct._id } },
      { new: true, runValidators: true }
    );
    return res.status(200).json(updatedProduct);
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((value) => value.message);
      return res.status(400).json({
        err: message,
      });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export { productRouter };

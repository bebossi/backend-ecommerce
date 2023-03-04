import express from "express";
import { OrderModel } from "../models/Order/order.model.js";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import { ProductModel } from "../models/Product/product.model.js";

const orderRouter = express.Router();

orderRouter.post("/new-order", isAuth, attachCurrentUser, async (req, res) => {
  try {
    let newOrder = await OrderModel.create({
      ...req.body,
      buyerId: req.currentUser._id,
    });

    await ProductModel.findOneAndUpdate(
      { _id: req.currentUser._id },
      { $push: { orderProducts: product._id } },
      { new: true, runValidators: true }
    );

    return res.status(201).json(newOrder);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

export default orderRouter;

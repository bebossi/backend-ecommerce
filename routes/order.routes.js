import express from "express";
import { OrderModel } from "../models/Order/order.model.js";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import { UserModel } from "../models/User/user.model.js";
import { ProductModel } from "../models/Product/product.model.js";

const orderRouter = express.Router();

orderRouter.post("/", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const newOrder = await OrderModel.create({
      ...req.body,
      buyerId: req.currentUser._id,
      orderProducts: productId,
    });

    const product = await ProductModel.findById(productId);

    product.quantity -= quantity;
    await product.save();

    await UserModel.findOneAndUpdate(
      { _id: req.currentUser._id },
      { $push: { orderProducts: newOrder._id } },
      { new: true, runValidators: true }
    );

    return res.status(201).json(newOrder);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

orderRouter.get("/:userId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await OrderModel.find({ buyerId: userId }).populate(
      "orderProducts"
    );

    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

orderRouter.get(
  "/:buyerId/:orderId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { buyerId, orderId } = req.params;

      const order = await OrderModel.findById(orderId)
        .populate("buyerId", { name: 1 })
        .populate("orderProducts", { productName: 1, price: 1 });

      if (!order) {
        return res.status(404).send({ message: "Order not found" });
      }

      if (
        req.currentUser.id !== buyerId &&
        req.currentUser.id !== order.sellerId._id
      ) {
        return res.status(403).send({ message: "Access denied" });
      }

      return res.status(200).json(order);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Internal server error" });
    }
  }
);
export default orderRouter;

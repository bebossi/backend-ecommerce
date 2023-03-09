import express from "express";
import { OrderModel } from "../models/Order/order.model.js";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import { UserModel } from "../models/User/user.model.js";
import { ProductModel } from "../models/Product/product.model.js";

const orderRouter = express.Router();

orderRouter.post("/", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await ProductModel.findById(productId);

    const newOrder = await OrderModel.create({
      ...req.body,
      buyerId: req.currentUser._id,
      
    });

    product.quantity -= req.body.quantity;
    await product.save();

    await UserModel.findOneAndUpdate(
      { _id: req.currentUser._id },
      { $push: { orders: newOrder._id } },
      { new: true, runValidators: true }
    );

    return res.status(201).json(newOrder);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

orderRouter.get("/get", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const userId = req.currentUser._id;
    const orders = await OrderModel.find({ buyerId: userId })
      .populate("productId", { productName: 1 })
      .populate("sellerId", {
        state: 1,
        city: 1,
        street: 1,
        houseNumber: 1,
        apartmentNumber: 1,
        CEP: 1,
      })
      .populate("buyerId", {
        state: 1,
        city: 1,
        street: 1,
        houseNumber: 1,
        apartmentNumber: 1,
        CEP: 1,
      });

    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

orderRouter.get(
  "/order-details/:orderId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const buyerId = toString(req.currentUser._id);

      const order = await OrderModel.findById(orderId)
        .populate("buyerId")
        .populate("productId", { productName: 1, price: 1, image: 1 })
        .populate("sellerId");

      if (!order) {
        return res.status(404).send({ message: "Order not found" });
      }

      // acrescentar requisição de verificar se e buyer ou seller
      // if (
      //   req.currentUser._id !== toString(order.buyerId._id) ||
      //   req.currentUser._id !== toString(order.sellerId)
      // ) {
      //   return res.status(403).send({ message: "Access denied" });
      // }

      return res.status(200).json(order);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Internal server error" });
    }
  }
);
export default orderRouter;

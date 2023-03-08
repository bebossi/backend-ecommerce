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
    });

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

productRouter.put(
  "/:productId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { productId } = req.params;
      if (!req.currentUser.products.includes(req.params.productId)) {
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
  }
);

productRouter.get("/", isAuth, async (req, res) => {
  try {
    const products = await ProductModel.find({}, { body: 0 }).populate(
      "sellerId",
      { name: 1, products: 1, orders: 1, image: 1, email: 1 }
    );

    return res.status(200).json(products);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

productRouter.get(
  "/products-user",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const sellerId = req.currentUser._id;

      const products = await ProductModel.find(
        { sellerId: sellerId },
        { body: 0 }
      );

      return res.status(200).json(products);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

productRouter.get("/product-details/:productId", isAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findOne({ _id: productId }).populate(
      "sellerId"
    );

    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});
productRouter.delete(
  "/:productId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      if (!req.currentUser.products.includes(req.params.productId)) {
        return res
          .status(401)
          .json("Você não tem permissão para realizar essa ação!");
      }

      const deletedProduct = await ProductModel.deleteOne({
        _id: req.params.productId,
      });

      await UserModel.findOneAndUpdate(
        { _id: req.currentUser._id },
        { $pull: { products: req.params.productId } },
        { new: true, runValidators: true }
      );

      return res.status(200).json({ message: "Produto deletado com sucesso!" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

export { productRouter };

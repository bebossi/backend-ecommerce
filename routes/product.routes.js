import express from "express";
import { ProductModel } from "../models/Product/product.model";
import { UserModel } from "../models/User/user.model";

const productRouter = express.Router();

productRouter.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const newProduct = await ProductModel.create({ ...req.body, user: userId });

    await UserModel.findOneAndUpdate(
      { _id: userId },
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

productRouter.put("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const updatedProduct = await ProductModel.findOneAndUpdate(
        {_id: productId},
        {...req.body},
        {new: true, runValidators: true}
        );

        await UserModel.findOneAndUpdate(
            {_id: productId},
            {$push: {products: updatedProduct._id}},
            {new: true, runValidators: true}
            )
        return res.status(200).json(updatedProduct)
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

import express from "express";
import { UserModel } from "../models/User/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../config/jwt.config.js";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import { OrderModel } from "../models/Order/order.model.js";
import { ProductModel } from "../models/Product/product.model.js";

const userRouter = express.Router();

const SALT_ROUNDS = 10;

userRouter.post("/signup", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Senha invalida." });
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);

    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    delete createdUser._doc.passwordHash;

    return res.status(200).json(createdUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "Email ou senha inválidos" });
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      const token = generateToken(user);

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          role: user.role,
        },
        token: token,
      });
    } else {
      return res.status(404).json({ message: "Email ou senha inválidos" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.put("/", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.currentUser._id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    delete updatedUser._doc.passwordHash;

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Arrumar para soft delete
userRouter.delete("/", isAuth, attachCurrentUser, async (req, res) => {
  try {
    await UserModel.findOneAndDelete({ _id: req.currentUser._id });

    return res.status(204).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.get("/", async (req, res) => {
  try {
    const users = await UserModel.find();

    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json(Error);
  }
});

userRouter.get("/:userId", isAuth, async (req, res) => {
  try {
    const user = await UserModel.findOne(
      { _id: req.params.userId },
      { passwordHash: 0 }
    )
      .populate("orders")
      .populate("products");

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(Error);
  }
});

export { userRouter };

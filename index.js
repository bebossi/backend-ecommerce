import express from "express";
import * as dotenv from "dotenv";
import { connectDB } from "./config/db.config.js";
import { userRouter } from "./routes/user.routes.js";
import { uploadImageRouter } from "./routes/uploadImage.routes.js";
import { productRouter } from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
import cors from "cors";

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/uploadImage", uploadImageRouter);
app.use("/order", orderRouter);

app.listen(Number(process.env.PORT), () => {
  console.log(`Server running and up at port ${Number(process.env.PORT)}`);
});

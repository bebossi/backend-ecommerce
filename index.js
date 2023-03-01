import express from "express";
import * as dotenv from "dotenv";
import { connectDB } from "./config/db.config.js";
import { userRouter } from "./routes/user.routes.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use("/user", userRouter)

app.listen(Number(process.env.PORT), () => {
    console.log(`Server running and up at port ${Number(process.env.PORT)}`)
})
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./src/routes/User.js";
import ProductsRouter from "./src/routes/Products.js";
import ReviewRouter from "./src/routes/Review.js";
import CartRouter from "./src/routes/Cart.js";
import CategoryRouter from "./src/routes/Category.js";
import LoginRouter from "./src/routes/Login.js";
import OrderRouter from "./src/routes/Order.js";
import AddressRouter from "./src/routes/Address.js";
import CouponRouter from "./src/routes/Coupon.js";
import StatsRouter from "./src/routes/stats.js";
import bodyParser from "body-parser";
import { connectToDatabase } from "./src/utils/mongodb.js";

const app = express();
const port = 4000;


dotenv.config();

connectToDatabase();

process.env.FRONTEND;

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use(cors({
    origin: [process.env.FRONTEND,"http://192.168.0.104:5173","http://192.168.0.106:5173 "],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));


// Routes
app.use("/user", userRouter);
app.use("/products", ProductsRouter);
app.use("/review", ReviewRouter);
app.use("/cart", CartRouter);
app.use("/category", CategoryRouter);
app.use("/login", LoginRouter);
app.use("/order",OrderRouter)
app.use("/shipping-address",AddressRouter)
app.use("/coupon",CouponRouter)
app.use("/stats",StatsRouter)

// Start server
app.get("/", (req, res) => {
    res.send("Server is running");
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

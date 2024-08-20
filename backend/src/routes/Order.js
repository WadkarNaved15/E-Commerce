import express from "express";
import { tryCatchWrapper } from "../utils/Functions.js";
import { createOrder , getOrders , updateOrder , myOrders , cancelOrder , verifyPayment, bestSellers} from "../utils/Order.js";
import { authenticateToken, upload } from "../middlewares/Functions.js";

const router = express.Router();

router.post("/new",authenticateToken, tryCatchWrapper(createOrder));
router.post("/update",authenticateToken, tryCatchWrapper(updateOrder));
router.get("/all", tryCatchWrapper(getOrders));
router.post("/verify", tryCatchWrapper(verifyPayment));
router.post("/cancel",authenticateToken, tryCatchWrapper(cancelOrder));
router.get("/my-orders",authenticateToken, tryCatchWrapper(myOrders));
router.get("/best-sellers", tryCatchWrapper(bestSellers));

export default router
import express from "express";
import { tryCatchWrapper } from "../utils/Functions.js";
import { createOrder , getAllOrders , updateOrder , myOrders , cancelOrder , verifyPayment, bestSellers, updateOrderStatus} from "../utils/Order.js";
import { authenticateToken, upload } from "../middlewares/Functions.js";

const router = express.Router();

router.post("/new",authenticateToken, tryCatchWrapper(createOrder));
router.post("/update",authenticateToken, tryCatchWrapper(updateOrder));
router.post("/", tryCatchWrapper(getAllOrders));
router.post("/verify", tryCatchWrapper(verifyPayment));
router.post("/cancel",authenticateToken, tryCatchWrapper(cancelOrder));
router.get("/my-orders",authenticateToken, tryCatchWrapper(myOrders));
router.get("/best-sellers", tryCatchWrapper(bestSellers));
router.put("/",tryCatchWrapper(updateOrderStatus));

export default router
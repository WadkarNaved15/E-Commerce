import express from "express";
import { tryCatchWrapper } from "../utils/Functions.js";
import { createCoupon, getCoupons, getCoupon ,applyCoupon} from "../utils/Coupon.js";
import { authenticateToken } from "../middlewares/Functions.js";


const router = express.Router();


router.post("/new",authenticateToken, tryCatchWrapper(createCoupon));

router.get("/all", tryCatchWrapper(getCoupons));

router.post("/apply",authenticateToken, tryCatchWrapper(applyCoupon));

export default router;
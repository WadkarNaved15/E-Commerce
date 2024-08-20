import express from "express";
import { tryCatchWrapper } from "../utils/Functions.js";
import { createUser , getAllUsers, getUser, getUserDetails,updateUserDetails } from "../utils/Users.js";
import {authenticateToken} from "../middlewares/Functions.js";

const router = express.Router();

router.post("/new", tryCatchWrapper(createUser));

router.get("/all", tryCatchWrapper(getAllUsers));

router.post("/",authenticateToken, tryCatchWrapper(getUser));

router.get("/",authenticateToken, tryCatchWrapper(getUserDetails));

router.put("/",authenticateToken, tryCatchWrapper(updateUserDetails));



export default router;
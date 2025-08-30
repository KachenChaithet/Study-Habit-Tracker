import express from "express";
import { saveFcmToken } from "../Controllers/fcmController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/setuserfcm",protect, saveFcmToken);

export default router;

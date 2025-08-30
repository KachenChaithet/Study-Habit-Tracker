import express from "express";
import { getUserRecommendation } from "../Controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/analyze", protect, getUserRecommendation);

export default router;

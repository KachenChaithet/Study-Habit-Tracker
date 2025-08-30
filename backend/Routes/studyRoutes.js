import express from "express";
import { createLog, deleteLog, getLogs, updateLog } from "../Controllers/studyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/logs",protect, createLog);
router.get("/logs",protect, getLogs);
router.put("/logs/:id",protect, updateLog);
router.delete("/logs/:id",protect, deleteLog);

export default router;

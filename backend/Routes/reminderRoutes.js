import express from "express";
import {
    createReminder,
    getRemindersByUser,
    updateReminder,
    deleteReminder
} from "../Controllers/reminderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/reminders
router.post("/", protect, createReminder);

// GET /api/reminders/:userId
router.get("/get", protect, getRemindersByUser);

// PUT /api/reminders/:id
router.put("/:id", updateReminder);

// DELETE /api/reminders/:id
router.delete("/:id", deleteReminder);

export default router;

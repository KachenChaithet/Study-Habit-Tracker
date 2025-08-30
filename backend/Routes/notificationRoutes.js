import express from "express";
import { sendReminderNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/send", sendReminderNotification);

export default router;

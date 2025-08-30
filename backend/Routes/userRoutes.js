import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();

// เก็บ FCM token ของ user
router.post("/:userId/fcmToken", async (req, res) => {
  const { userId } = req.params;
  const { fcmToken } = req.body;

  const user = await prisma.user.update({
    where: { id: Number(userId) },
    data: { fcmToken },
  });

  res.json(user);
});

export default router;

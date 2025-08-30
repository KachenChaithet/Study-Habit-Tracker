import { PrismaClient } from "@prisma/client";

import { messagingAdmin } from "../firebaseAdmin.js";

const prisma = new PrismaClient();


export const sendReminderNotification = async (req, res) => {
    const { userId, title, body } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user || !user.fcmToken) return res.status(404).json({ error: "User or FCM token not found" });

        const message = {
            notification: { title, body },
            token: user.fcmToken,
        };

        await messagingAdmin.send(message);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send notification" });
    }
};

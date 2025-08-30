// controllers/fcmController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// สร้าง Reminder

export const saveFcmToken = async (req, res) => {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
        return res.status(400).json({ message: 'Missing userId or fcmToken' });
    }



    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { fcmToken }
        });

        res.json({ message: 'FCM token saved', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

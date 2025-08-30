import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { messagingAdmin } from "../firebaseAdmin.js";

const prisma = new PrismaClient();

// ตรวจสอบ reminder ทุก ๆ นาที
cron.schedule("* * * * *", async () => {
    const now = new Date();

    const reminders = await prisma.reminder.findMany({
        where: {
            remindTime: { gte: new Date(now.getTime() - 60000), lte: now }
        },
        include: { user: true }
    });

    for (const reminder of reminders) {
        if (!reminder.user.fcmToken) continue;

        await messagingAdmin.send({
            token: reminder.user.fcmToken,
            notification: {
                title: "Reminder",
                body: reminder.subjectremin
            }
        });

        if (reminder.repeatDaily) {
            // ถ้า repeatDaily ให้ตั้งเวลาเป็นวันถัดไป แต่ sent เริ่มต้น false
            const nextTime = new Date(reminder.remindTime);
            nextTime.setDate(nextTime.getDate() + 1);
            await prisma.reminder.update({
                where: { id: reminder.id },
                data: { remindTime: nextTime, sent: false }
            });
        } else {
            // ถ้าไม่ repeatDaily ให้ sent = true
            await prisma.reminder.update({
                where: { id: reminder.id },
                data: { sent: true }
            });
        }

        console.log(`Reminder sent for user ${reminder.userId}: ${reminder.subjectremin}`);
    }
});

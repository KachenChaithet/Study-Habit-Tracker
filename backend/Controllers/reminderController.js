import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// สร้าง Reminder
export const createReminder = async (req, res) => {
  try {
    const { subjectremin, remindTime, repeatDaily } = req.body;

    // แปลง remindTime เป็น Date object
    const remindDate = new Date(remindTime.replace(" ", "T"));

    const reminder = await prisma.reminder.create({
      data: {
        userId: req.user.id,
        subjectremin,
        remindTime: remindDate,
        repeatDaily
      },
    });

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ดึง Reminder ของ user
export const getRemindersByUser = async (req, res) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.user.id },
    });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// แก้ไข Reminder
export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectremin, remindTime, repeatDaily } = req.body;
    const reminder = await prisma.reminder.update({
      where: { id: Number(id) },
      data: { subjectremin, remindTime, repeatDaily },
    });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ลบ Reminder
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.reminder.delete({ where: { id: Number(id) } });
    res.json({ message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

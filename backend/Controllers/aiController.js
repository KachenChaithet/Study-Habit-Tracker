import axios from "axios";
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient();

export const getUserRecommendation = async (req, res) => {
    try {
        const userId = req.user.id;

        // ดึง logs ของ user
        const logs = await prisma.log.findMany({
            where: { userId },
            select: { subject: true, duration: true }
        });

        if (!logs || logs.length === 0) {
            return res.json({ summaryRecommendation: "ไม่มีข้อมูลเพียงพอ", insights: {} });
        }

        // แปลง logs เป็นข้อความสำหรับ AI
        const logsText = logs.map(l => `วิชา: ${l.subject}, เวลาเรียน: ${l.duration} นาที`).join("\n");

        const prompt = `
คุณเป็นผู้ช่วยวิเคราะห์การเรียนของนักเรียน
ข้อมูลการเรียนของเขามีดังนี้:
${logsText}

กรุณาสรุปคำแนะนำโดยรวม, วิชาที่ควรปรับปรุง, และรูปแบบการเรียนของนักเรียน
**ตอบเป็น JSON เท่านั้น** แบบนี้:
{
  "summaryRecommendation": "...",
  "insights": {
    "studyPattern": "...",
    "leastConsistentSubject": "..."
  }
}
`;

        // เรียก Deepseek ผ่าน OpenRouter
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-chat-v3-0324:free",
                messages: [
                    { role: "user", content: prompt }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000 // ตั้ง timeout 15 วินาที
            }
        );

        // ดึงผลลัพธ์จาก AI
        const aiContent = response.data.choices[0].message.content;

        // ดึง JSON จากข้อความ (กรณี AI ใส่ข้อความอื่นมาด้วย)
        let result;
        try {
            const match = aiContent.match(/\{[\s\S]*\}/);
            if (match) {
                result = JSON.parse(match[0]);
            } else {
                result = { summaryRecommendation: "ไม่สามารถวิเคราะห์ข้อมูลได้", insights: {} };
            }
        } catch {
            result = { summaryRecommendation: "ไม่สามารถวิเคราะห์ข้อมูลได้", insights: {} };
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

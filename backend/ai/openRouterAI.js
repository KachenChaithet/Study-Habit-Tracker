import axios from "axios";
import { PrismaClient } from "@prisma/client";

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
ตอบเป็น JSON: { "summaryRecommendation": "...", "insights": { "studyPattern": "...", "leastConsistentSubject": "..."} }
`;

        // เรียก Deepseek ผ่าน OpenRouter
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-chat-v3.1",
                messages: [
                    { role: "user", content: prompt }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // ดึงผลลัพธ์จาก AI
        const aiContent = response.data.choices[0].message.content;

        // แปลงเป็น JSON
        let result;
        try {
            result = JSON.parse(aiContent);
        } catch {
            result = { summaryRecommendation: "ไม่สามารถวิเคราะห์ข้อมูลได้", insights: {} };
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

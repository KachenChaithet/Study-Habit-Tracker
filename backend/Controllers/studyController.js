import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// POST /api/logs - เพิ่มชั่วโมงเรียน
export const createLog = async (req, res) => {
    try {
        const { subject, duration } = req.body

        if (!subject || !duration) {
            return res.status(400).json({ error: "subject, date, duration required" })
        }

        const log = await prisma.log.create({
            data: {
                subject,
                duration: Number(duration),
                userId: req.user.id, // assume มี middleware auth
            },
        })

        res.status(201).json({ log })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// GET /api/logs - ดึง log ของ user
export const getLogs = async (req, res) => {
    try {
        const { startDate, endDate } = req.query

        const logs = await prisma.log.findMany({
            where: {
                userId: req.user.id,
                ...(startDate || endDate
                    ? {
                        createdAt: {
                            ...(startDate ? { gte: new Date(startDate) } : {}),
                            ...(endDate ? { lte: new Date(endDate) } : {}),
                        },
                    }
                    : {}),
            },
            orderBy: { createdAt: 'desc' },
        })

        res.json(logs)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


// PUT /api/logs/:id - แก้ไข log
export const updateLog = async (req, res) => {
    try {
        const { id } = req.params
        const { subject, duration } = req.body

        const updatedLog = await prisma.log.update({
            where: {
                id: Number(id),
                // Prisma ไม่ให้ where มีหลาย field ถ้าไม่ unique
                // ดังนั้นต้องเช็ค userId แยกก่อน
            },
            data: {
                ...(subject && { subject }),
                ...(duration && { duration: Number(duration) }),
            },
        })

        // เช็คว่า log นี้เป็นของ user คนนี้จริง ๆ
        if (updatedLog.userId !== req.user.id) {
            return res.status(403).json({ error: "Not your log" })
        }

        res.json({ log: updatedLog })
    } catch (err) {
        if (err.code === "P2025") { // Prisma error: record not found
            return res.status(404).json({ error: "Log not found" })
        }
        res.status(500).json({ error: err.message })
    }
}

// DELETE /api/logs/:id - ลบ log
export const deleteLog = async (req, res) => {
    try {
        const { id } = req.params

        const log = await prisma.log.deleteMany({
            where: { id: Number(id), userId: req.user.id },
        })

        if (log.count === 0) {
            return res.status(404).json({ error: "Log not found" })
        }

        res.json({ success: true, deletedId: Number(id) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

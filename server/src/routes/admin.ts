import express from 'express'
import { prisma } from '../prisma'
import { requireAuth } from '../middleware/requireAuth'
import { requireAdmin } from '../middleware/requireAdmin'
import { Request, Response } from 'express'
import { requireNotBlocked } from '../middleware/requireNotBlocked'
import {batchActionSchema, handleBatchAction } from '../utils/handleBatchAction'


const router = express.Router()

router.use(requireAuth, requireNotBlocked, requireAdmin)

//получить список всех пользователей
router.get('/users', async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                nickname: true,
                email: true,
                isAdmin: true,
                isBlocked: true,
                createdAt: true,
            },
        }),
        prisma.user.count(),
    ])

    res.json({
        users,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    })
})

router.patch('/users/batch', async (req, res) => {
    try {
        const { userIds, action } = batchActionSchema.parse(req.body)

        const result = await handleBatchAction(
            userIds,
            action,
            req.session.userId!
        )

        res.json(result)
    } catch (error) {
        // Обработка ошибок Zod (или других)
        if (error instanceof Error) {
            res.status(400).json({ error: error.message })
        } else {
            res.status(400).json({ error: 'Unknown error' })
        }
    }
})

export default router

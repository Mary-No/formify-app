import { Router } from "express"
import { requireApiTokenOrSession } from "../middleware/requireApiTokenOrSession"
import { handleRequest } from "../utils/handleRequest"
import { prisma } from "../prisma"
import { randomUUID } from "crypto"

const router = Router()



router.post('/generate-api-token', requireApiTokenOrSession, handleRequest(async (req, res) => {
    const userId = req.session.userId
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    const token = randomUUID()
    await prisma.user.update({
        where: { id: userId },
        data: { apiToken: token }
    })

    res.json({ apiToken: token })
}))

router.get('/aggregated-results', requireApiTokenOrSession, handleRequest(async (req, res) => {
    const userId = (req.user as { id: string })?.id || req.session.userId;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const templates = await prisma.template.findMany({
        where: { authorId: userId },
        include: {
            questions: {
                include: {
                    answers: true
                }
            }
        }
    });

    const aggregated = templates.map(template => {
        return {
            id: template.id,
            title: template.title,
            description: template.description,
            topic: template.topic,
            createdAt: template.createdAt,
            questions: template.questions.map(q => {
                const values = q.answers.map(a => a.value)

                if (q.type === 'INTEGER') {
                    const nums = values.map(v => Number(v)).filter(v => !isNaN(v))
                    const sum = nums.reduce((a, b) => a + b, 0)
                    const avg = nums.length ? sum / nums.length : null
                    return {
                        id: q.id,
                        text: q.text,
                        type: q.type,
                        min: nums.length ? Math.min(...nums) : null,
                        max: nums.length ? Math.max(...nums) : null,
                        average: avg
                    }
                }

                if (q.type === 'SHORT_TEXT' || q.type === 'LONG_TEXT' || q.type === 'CHECKBOX' || q.type === 'SINGLE_CHOICE') {
                    // Группируем одинаковые ответы и берём топ 3
                    const freq: Record<string, number> = {}
                    for (const v of values) {
                        const key = typeof v === 'string' ? v : JSON.stringify(v)
                        freq[key] = (freq[key] || 0) + 1
                    }
                    const topAnswers = Object.entries(freq)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([val, count]) => ({ answer: val, count }))

                    return {
                        id: q.id,
                        text: q.text,
                        type: q.type,
                        topAnswers
                    }
                }

                return {
                    id: q.id,
                    text: q.text,
                    type: q.type,
                    values
                }
            })
        }
    })

    res.json({ templates: aggregated })
}))

export default router
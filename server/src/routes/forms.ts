import express from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { requireNotBlocked } from '../middleware/requireNotBlocked'
import { prisma } from '../prisma'
import { handleRequest } from '../utils/handleRequest'
import { getUserId } from '../utils/getUserId'
import { isAuthorOrAdmin } from '../utils/isAuthorOrAdmin'



const router = express.Router()

// Отправить ответы по форме (заполнить форму)
router.post('/', requireAuth, requireNotBlocked, handleRequest(async (req, res) => {
    const userId = getUserId(req)
        const { templateId, answers } = req.body

        if (!templateId || !Array.isArray(answers)) {
            res.status(400).json({ error: 'templateId and answers are required' })
            return
        }
        const template = await prisma.template.findUnique({
            where: { id: templateId },
            select: { id: true, isPublic: true },
        })

        if (!template || !template.isPublic) {
            res.status(404).json({ error: 'Template not found' })
            return
        }

    const existingForm = await prisma.form.findFirst({
        where: {
            templateId,
            userId,
        },
    })
    if (existingForm) {
        res.status(400).json({ error: 'You have already submitted this form' })
        return
    }
        const form = await prisma.form.create({
            data: {
                templateId,
                userId,
                answers: {
                    create: answers.map((ans: any) => ({
                        questionId: ans.questionId,
                        value: ans.value,
                    })),
                },
            },
            include: { answers: true },
        })

        res.status(201).json({ form })
}))

// Получить все ответы по шаблону (доступно автору шаблона и админам)
router.get('/results/:templateId', requireAuth, requireNotBlocked, handleRequest(async (req, res) => {
    const userId = getUserId(req)
        const { templateId } = req.params

        const template = await prisma.template.findUnique({
            where: { id: templateId },
            select: { authorId: true },
        })

        if (!template) {
            res.status(404).json({ error: 'Template not found' })
            return
        }

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } })

        if (template.authorId !== userId && !user?.isAdmin) {
            res.status(403).json({ error: 'Access denied' })
            return
        }

        // Получим все формы с ответами
        const forms = await prisma.form.findMany({
            where: { templateId },
            include: {
                user: { select: { id: true, nickname: true } },
                answers: true,
            },
        })

        res.json({ forms })
}))

router.get('/:formId', requireAuth, requireNotBlocked, handleRequest(async (req, res) => {
    const userId = getUserId(req)
    const { formId } = req.params

    const form = await prisma.form.findUnique({
        where: { id: formId },
        include: {
            answers: true,
            template: {
                include: {
                    questions: {
                        orderBy: { order: 'asc' },
                    },
                },
            },
        },
    })

    if (!form) {
        res.status(404).json({ error: 'Form not found' })
        return
    }

    const isAllowed = await isAuthorOrAdmin({ userId, resourceAuthorId: form.userId })

    if (!isAllowed) {
        res.status(403).json({ error: 'Access denied' })
        return
    }

    res.json({ form })
}))

router.get(
    '/mine',
    requireAuth,
    requireNotBlocked,
    handleRequest(async (req, res) => {
        const userId = req.session.userId

        const forms = await prisma.form.findMany({
            take: 20,
            skip: Number(req.query.skip ?? 0),
            where: {
                userId: userId,
            },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                template: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                emailSent: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        res.json({ forms })
    })
)

router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params
    const userId = req.session.userId!

    const form = await prisma.form.findUnique({
        where: { id },
        select: { userId: true },
    })

    if (!form) {
        res.status(404).json({ error: 'Form not found' })
        return
    }

    const isAllowed = await isAuthorOrAdmin({ userId, resourceAuthorId: form.userId })
    if (!isAllowed) {
        res.status(403).json({ error: 'Forbidden: not the author or admin' })
        return
    }

    await prisma.form.delete({ where: { id } })

    res.status(200).json({ message: 'Form deleted successfully' })
})

//редактировать ответы
router.patch('/:formId', requireAuth, requireNotBlocked, handleRequest(async (req, res) => {
    const userId = getUserId(req)
    const { formId } = req.params
    const { answers } = req.body

    if (!Array.isArray(answers)) {
        res.status(400).json({ error: 'answers must be an array' })
        return
    }

    const form = await prisma.form.findUnique({
        where: { id: formId },
        select: { userId: true },
    })

    if (!form) {
        res.status(404).json({ error: 'Form not found' })
        return
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
    })

    const isAllowed = await isAuthorOrAdmin({ userId, resourceAuthorId: form.userId })
    if (!isAllowed) {
        res.status(403).json({ error: 'Access denied' })
        return
    }

    await prisma.answer.deleteMany({
        where: { formId },
    })

    await prisma.form.update({
        where: { id: formId },
        data: { updatedAt: new Date() },
    })

    res.json({ message: 'Form updated', answersCount: answers.length })
}))

export default router

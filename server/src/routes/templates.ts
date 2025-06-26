import express from 'express'
import { prisma } from '../prisma'
import { requireAuth } from '../middleware/requireAuth'
import { requireNotBlocked } from '../middleware/requireNotBlocked'
import { handleRequest } from '../utils/handleRequest'
import { getUserId } from '../utils/getUserId'
import { getIO } from '../socket'
import z from 'zod'
import {QuestionType, Topic } from '@prisma/client'
import {questionSchema, TopicEnum, updateTemplateSchema } from '../types/templates'
import { isAuthorOrAdmin } from '../utils/isAuthorOrAdmin'
import { toTemplateCardDto } from '../utils/toTemplateCardDto'



const router = express.Router()

// Создать новый шаблон
export const createTemplateSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    topic: TopicEnum,
    tags: z.array(z.string()).optional().default([]),
    isPublic: z.boolean().optional().default(true),
    questions: z.array(questionSchema).optional().default([]),
})

router.post('/', requireAuth, requireNotBlocked, handleRequest(async (req, res) => {
    const parseResult = createTemplateSchema.safeParse(req.body)
    if (!parseResult.success) {
       res.status(400).json({ error: parseResult.error.errors })
        return
    }

    const { title, description, topic, tags, isPublic, questions } = parseResult.data
    const userId = getUserId(req)

    const prismaTopic: Topic = topic as Topic

    const template = await prisma.template.create({
        data: {
            title,
            description,
            topic: topic as Topic,
            tags: {
                connectOrCreate: tags
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0)
                    .map(tag => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
            },
            isPublic,
            authorId: userId,
            questions: {
                create: questions.map((q, index) => ({
                    text: q.text,
                    type: q.type as QuestionType,
                    order: index,
                    required: q.required ?? false,
                })),
            },
        },
        include: {
            questions: true,
            author: {
                select: { id: true, nickname: true },
            },
        },
    })


    res.status(201).json({ template })
}))

//получить все шаблоны
router.get('/', handleRequest(async (req, res) => {
    const userId = req.session?.userId
    const skip = Number(req.query.skip ?? 0)
    const take = 20
    const search = req.query.search as string || ''
    const sortOrder = req.query.order === 'asc' ? 'asc' : 'desc'
    const topic = req.query.topic as string | undefined
    const tags = Array.isArray(req.query.tags) ? req.query.tags : req.query.tags ? [req.query.tags] : []

    const filters: any = { isPublic: true }
    if (topic) filters.topic = topic
    if (search) {
        filters.AND = [
            ...(filters.AND || []),
            {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    {
                        comments: {
                            some: {
                                text: { contains: search, mode: 'insensitive' },
                            },
                        },
                    },
                ],
            },
        ]
    }
    if (tags.length > 0) filters.tags = { some: { name: { in: tags } } }

    const templates = await prisma.template.findMany({
        where: filters,
        skip,
        take,
        orderBy: { createdAt: sortOrder },
        include: {
            author: { select: { id: true, nickname: true } },
            tags: true,
            _count: { select: { likes: true } },
            likes: userId ? { where: { userId }, select: { userId: true } } : false,
        },
    })

    const result = await Promise.all(
        templates.map(t => toTemplateCardDto(t, userId))
    )

    res.json({ templates: result })
}))


//получить свои шаблоны
router.get(
    '/mine',
    requireAuth,
    requireNotBlocked,
    handleRequest(async (req, res) => {
        const userId = req.session.userId;

        const templates = await prisma.template.findMany({
            take: 20,
            skip: Number(req.query.skip ?? 0),
            where: {
                authorId: userId,
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({ templates });
    })
);
router.get('/overview', handleRequest(async (req, res) => {
    const userId = req.session?.userId;

    const [popularTemplates, latestTemplates] = await Promise.all([
        prisma.template.findMany({
            where: { isPublic: true },
            orderBy: { likes: { _count: 'desc' } },
            take: 10,
            include: {
                author: { select: { id: true, nickname: true } },
                tags: true,
                _count: { select: { likes: true } },
                likes: userId ? { where: { userId }, select: { userId: true } } : false,
            },
        }),
        prisma.template.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                author: { select: { id: true, nickname: true } },
                tags: true,
                _count: { select: { likes: true } },
                likes: userId ? { where: { userId }, select: { userId: true } } : false,
            },
        }),
    ]);

    res.json({
        popular: popularTemplates.map(t => toTemplateCardDto(t, userId)),
        latest: latestTemplates.map(t => toTemplateCardDto(t, userId)),
    });
}));

// Получить облако тегов с их "весом"
router.get('/tags', handleRequest(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 30

    const tags = await prisma.tag.findMany({
        select: {
            name: true,
            _count: {
                select: { templates: true },
            },
        },
        orderBy: {
            templates: {
                _count: 'desc',
            },
        },
        take: Math.min(limit, 100),
    })

    const formatted = tags.map(tag => ({
        value: tag.name,
        count: tag._count.templates,
    }))

    res.json(formatted)
}))


router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params
    const userId = req.session.userId!

    const template = await prisma.template.findUnique({
        where: { id },
        select: { authorId: true },
    })

    if (!template) {
        res.status(404).json({ error: 'Template not found' })
        return
    }

    const isAllowed = await isAuthorOrAdmin({ userId, resourceAuthorId: template.authorId })
    if (!isAllowed) {
        res.status(403).json({ error: 'Forbidden: not the author or admin' })
        return
    }

    await prisma.template.delete({ where: { id } })

    res.status(200).json({ message: 'Template deleted successfully' })
})


//обновить шаблон
router.patch(
    '/:templateId',
    requireAuth,requireNotBlocked,
    handleRequest(async (req, res) => {
        const { templateId } = req.params;
        const userId = getUserId(req);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isAdmin: true, isBlocked: true },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const parseResult = updateTemplateSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ error: parseResult.error.errors });
            return;
        }

        const { title, description, topic, isPublic, tags = [], questions = [] } = parseResult.data;

        const existingTemplate = await prisma.template.findUnique({
            where: { id: templateId },
            select: { authorId: true },
        });

        if (!existingTemplate) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }

        const isAllowed = await isAuthorOrAdmin({ userId, resourceAuthorId: existingTemplate.authorId })
        if (!isAllowed) {
            res.status(403).json({ error: 'Forbidden: not the author or admin' })
            return
        }

        await prisma.question.deleteMany({ where: { templateId } });

        const updatedTemplate = await prisma.template.update({
            where: { id: templateId },
            data: {
                title,
                description,
                topic,
                isPublic,
                tags: {
                    set: [],
                    connectOrCreate: tags
                        .map(t => t.trim())
                        .filter(t => t.length > 0)
                        .map(t => ({
                            where: { name: t },
                            create: { name: t },
                        })),
                },
            },
        });

        if (questions.length > 0) {
            await prisma.question.createMany({
                data: questions.map((q, index) => ({
                    templateId,
                    text: q.text,
                    type: q.type,
                    order: index,
                    required: q.required ?? false,
                })),
            });
        }

        res.json({ template: updatedTemplate });
    })
);



// Получить шаблон по ID с вопросами, комментариями и лайками (если пользователь авторизован - показывать, есть ли лайк)
router.get('/:templateId', handleRequest(async (req, res) => {
    const { templateId } = req.params
    const userId = req.session?.userId

    const template = await prisma.template.findUnique({
        where: { id: templateId },
        include: {
            author: { select: { id: true, nickname: true } },
            questions: { orderBy: { order: 'asc' } },
            comments: {
                include: { author: { select: { id: true, nickname: true } } },
                orderBy: { createdAt: 'desc' },
            },
            tags: true,
            ...(userId && {
                likes: {
                    where: { userId },
                    select: { id: true },
                }
            }),
        },
    })

    const isOwner = template?.author?.id === userId
    if (!template || (!template.isPublic && !isOwner)) {
        res.status(404).json({ error: 'Template not found' })
        return
    }

    const likesCount = await prisma.like.count({ where: { templateId } })
    const likedByUser = userId ? template.likes?.length > 0 : false
    if ('likes' in template) delete (template as any).likes

    res.json({ template, likesCount, likedByUser })
}))



// Добавить лайк
router.post('/:templateId/like', requireAuth, requireNotBlocked, handleRequest(async (req, res) => {
    const userId = getUserId(req)
        const { templateId } = req.params
        const template = await prisma.template.findUnique({ where: { id: templateId }, select: { id: true, isPublic: true } })
        if (!template || !template.isPublic) {
            res.status(404).json({ error: 'Template not found' })
            return
        }
        try {
            await prisma.like.create({
                data: { userId, templateId },
            })
            res.json({ message: 'Liked' })
        } catch {
            await prisma.like.deleteMany({
                where: { userId, templateId },
            })
            res.json({ message: 'Unliked' })
        }
}))

// Добавить комментарий
router.post('/:templateId/comments', requireAuth, requireNotBlocked, handleRequest(async (req, res) => {
    const userId = getUserId(req)
        const { templateId } = req.params
        const { text } = req.body

        const template = await prisma.template.findUnique({ where: { id: templateId }, select: { id: true, isPublic: true } })
        if (!template || !template.isPublic) {
            res.status(404).json({ error: 'Template not found' })
            return
        }

        const comment = await prisma.comment.create({
            data: { authorId: userId, templateId, text },
            include: { author: { select: { id: true, nickname: true } } },
        })
        getIO().to(`template-${templateId}`).emit('new-comment', comment)

        res.status(201).json({ comment })
}))



export default router

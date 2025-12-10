import express from 'express'
import { prisma } from '../prisma'
import { requireAuth } from '../middleware/requireAuth'
import { requireNotBlocked } from '../middleware/requireNotBlocked'
import { handleRequest } from '../utils/handleRequest'
import { getUserId } from '../utils/getUserId'
import { getIO } from '../socket'
import z from 'zod'
import { Topic } from '@prisma/client'
import {questionSchema, TopicEnum, updateTemplateSchema } from '../types/templates'
import { isAuthorOrAdmin } from '../utils/isAuthorOrAdmin'
import { toTemplateCardDto } from '../utils/toTemplateCardDto'
import { $Enums } from '@prisma/client'

const router = express.Router()

export const createTemplateSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().default(''),
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

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true }
    });

    if (!user) {
        res.status(404).json({ message: "User not found" });
        return
    }

    if (!user.company) {
        const templateCount = await prisma.template.count({
            where: { authorId: userId }
        });

        if (templateCount >= 3) {
           res.status(400).json({ message: "You’ve reached the limit of 3 templates on the Basic plan. Upgrade your account to add more." });
           return
        }
    }

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
                create: questions.map((q, index) => {
                    const type = q.type as $Enums.QuestionType;
                    if (!Object.values($Enums.QuestionType).includes(type)) {
                        throw new Error(`Invalid question type: ${q.type}`);
                    }
                    return {
                        text: q.text,
                        type,
                        order: index,
                        required: q.required ?? false,
                        options: q.type === 'SINGLE_CHOICE' ? q.options ?? [] : [],
                        imageUrl: q.imageUrl ?? null,
                    }
                })
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


router.get('/', handleRequest(async (req, res) => {
    const userId = getUserId(req)
    const skip = Number(req.query.skip ?? 0)
    const take = 20
    const search = req.query.search as string || ''
    const sortOrder = req.query.order === 'asc' ? 'asc' : 'desc'
    const topic = req.query.topic as string | undefined
    const tags = Array.isArray(req.query.tags) ? req.query.tags : req.query.tags ? [req.query.tags] : []

    const mine = req.query.mine === 'true'

    const filters: any = {}

    if (mine) {
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' })
            return
        }
        filters.authorId = userId
    } else {
        filters.isPublic = true
    }

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

    if (tags.length > 0) {
        filters.tags = { some: { name: { in: tags } } }
    }

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

router.get('/overview', handleRequest(async (req, res) => {
    const userId = req.user?.id

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


router.delete('/:id', requireAuth, requireNotBlocked, async (req, res) => {
    const { id } = req.params
    const userId = getUserId(req)

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
    await prisma.tag.deleteMany({
        where: {
            templates: {
                none: {},
            },
        },
    })

    res.status(200).json({ message: 'Template deleted successfully' })
})

router.patch(
    '/:templateId',
    requireAuth,
    requireNotBlocked,
    handleRequest(async (req, res) => {
        const { templateId } = req.params;
        const userId = getUserId(req);

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

        const isAllowed = await isAuthorOrAdmin({ userId, resourceAuthorId: existingTemplate.authorId });
        if (!isAllowed) {
            res.status(403).json({ error: 'Forbidden: not the author or admin' });
            return;
        }

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

        const existingQuestions = await prisma.question.findMany({ where: { templateId } });
        const existingMap = new Map(existingQuestions.map(q => [q.id, q]));

        const incomingIds = new Set<string>();
        const toCreate: any[] = [];
        const updatePromises: Promise<any>[] = [];

        for (let index = 0; index < questions.length; index++) {
            const q = questions[index];

            const base = {
                text: q.text,
                type: q.type as $Enums.QuestionType,
                required: q.required ?? false,
                options: q.type === 'SINGLE_CHOICE' ? q.options ?? [] : [],
                imageUrl: q.imageUrl ?? null,
                order: index,
            };

            if (typeof q.id === 'string' && existingMap.has(q.id)) {
                const existing = existingMap.get(q.id)!;
                incomingIds.add(q.id);

                if (existing.type !== q.type) {
                    res.status(400).json({
                        error: `Cannot change question type from ${existing.type} to ${q.type}`,
                    });
                    return;
                }

                updatePromises.push(
                    prisma.question.update({
                        where: { id: q.id },
                        data: base,
                    })
                );
            } else {
                toCreate.push({ ...base, templateId });
            }
        }
        await Promise.all(updatePromises);

        if (toCreate.length > 0) {
            await prisma.question.createMany({ data: toCreate });
        }

        const idsToDelete = existingQuestions
            .map(q => q.id)
            .filter(id => !incomingIds.has(id));

        if (idsToDelete.length > 0) {
            await prisma.question.deleteMany({ where: { id: { in: idsToDelete } } });
        }

        res.json({ template: updatedTemplate });
    })
);

router.get('/:templateId', handleRequest(async (req, res) => {
    const { templateId } = req.params
    const userId = req.user?.id

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
import express from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { requireNotBlocked } from '../middleware/requireNotBlocked'
import { prisma } from '../prisma'
import { handleRequest } from '../utils/handleRequest'
import { getUserId } from '../utils/getUserId'
import { isAuthorOrAdmin } from '../utils/isAuthorOrAdmin'
import {requireAdmin} from "../middleware/requireAdmin";

const router = express.Router()
router.use(requireAuth, requireNotBlocked)

router.post('/', handleRequest(async (req, res) => {
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
    const questions = await prisma.question.findMany({
        where: { templateId },
        select: { id: true, type: true },
    });

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
    const filteredAnswers = answers.filter(ans => {
        const question = questions.find(q => q.id === ans.questionId);
        return question && (String(question.type) !== 'IMAGE');
    });
    const form = await prisma.form.create({
        data: {
            templateId,
            userId,
            answers: {
                create: filteredAnswers.map(ans => ({
                    value: ans.value ?? null,
                    question: { connect: { id: ans.questionId } },
                })),
            },
        },
        include: { answers: true },
    })

        res.status(201).json({ form })
}))

router.get(
    '/mine',
    handleRequest(async (req, res) => {
        const userId = getUserId(req)

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


router.get('/results/:templateId', handleRequest(async (req, res) => {
    const userId = getUserId(req);
    const { templateId } = req.params;

    const template = await prisma.template.findUnique({
        where: { id: templateId },
        select: { authorId: true },
    });

    if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });

    if (template.authorId !== userId && !user?.isAdmin) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }

    const questions = await prisma.question.findMany({
        where: { templateId },
        select: { id: true, type: true },
    });

    const forms = await prisma.form.findMany({
        where: { templateId },
        include: {
            user: { select: { id: true, nickname: true } },
            answers: true,
        },
    });

    const filteredForms = forms.map(form => ({
        ...form,
        answers: form.answers.filter(answer => {
            const question = questions.find(q => q.id === answer.questionId);
            return (String(question?.type) !== 'IMAGE');
        }),
    }));

    res.json({ forms: filteredForms });
}));


router.get('/:formId', handleRequest(async (req, res) => {
    const userId = getUserId(req);
    const { formId } = req.params;

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
    });

    if (!form) {
        res.status(404).json({ error: 'Form not found' });
        return;
    }

    const isAllowed = await isAuthorOrAdmin({ userId, resourceAuthorId: form.userId });

    if (!isAllowed) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }

    const filteredAnswers = form.answers.filter(answer => {
        const question = form.template.questions.find(q => q.id === answer.questionId);
        return (String(question?.type) !== 'IMAGE');
    });

    res.json({
        ...form,
        answers: filteredAnswers,
    });
}));



router.delete('/:id', async (req, res) => {
    const { id } = req.params
    const userId = getUserId(req)

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
router.patch('/:formId', handleRequest(async (req, res) => {
    const userId = getUserId(req);
    const { formId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
        res.status(400).json({ error: 'Answers must be an array' });
        return;
    }

    const form = await prisma.form.findUnique({
        where: { id: formId },
        select: { userId: true, templateId: true },
    });

    if (!form) {
        res.status(404).json({ error: 'Form not found' });
        return;
    }

    const isAllowed = await isAuthorOrAdmin({ userId, resourceAuthorId: form.userId });
    if (!isAllowed) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }

    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, type: true },
    });

    const imageQuestionIds = new Set(
        questions.filter(q => String(q.type) === 'IMAGE').map(q => q.id)
    );

    const filteredAnswers = answers.filter(a => !imageQuestionIds.has(a.questionId));

    const existingAnswers = await prisma.answer.findMany({
        where: { formId },
        select: { id: true, questionId: true },
    });

    const existingAnswersMap = new Map(existingAnswers.map(a => [a.questionId, a.id]));

    const toUpdate = [];
    const toCreate = [];

    for (const a of filteredAnswers) {
        if (existingAnswersMap.has(a.questionId)) {
            toUpdate.push({
                id: existingAnswersMap.get(a.questionId)!,
                value: a.value,
            });
        } else {
            toCreate.push({
                formId,
                questionId: a.questionId,
                value: a.value,
            });
        }
    }

    await prisma.$transaction([
        ...toUpdate.map(u =>
            prisma.answer.update({
                where: { id: u.id },
                data: { value: u.value },
            })
        ),
        ...(toCreate.length > 0 ? [prisma.answer.createMany({ data: toCreate })] : []),
        prisma.form.update({
            where: { id: formId },
            data: { updatedAt: new Date() },
        }),
    ]);

    res.status(200).json({ message: 'Form updated', answersCount: filteredAnswers.length });
}));


router.get('/aggregated/:templateId', handleRequest(async (req, res) => {
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

    const isAllowed = await isAuthorOrAdmin({ userId, resourceAuthorId: template.authorId })
    if (!isAllowed) {
        res.status(403).json({ error: 'Access denied' })
        return
    }

    const questionsWithAnswers = await prisma.question.findMany({
        where: { templateId },
        orderBy: { order: 'asc' },
        select: {
            id: true,
            text: true,
            type: true,
            options: true,
            imageUrl: true,
            answers: {
                select: {
                    value: true,
                    form: {
                        select: {
                            user: {
                                select: { id: true, nickname: true }
                            }
                        }
                    }
                }
            }
        }
    });

    const formatted = questionsWithAnswers.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        imageUrl: q.imageUrl,
        answers: q.answers.map(a => ({
            author: a.form.user.nickname,
            userId: a.form.user.id,
            value: a.value,
        }))
    }));

    res.json({ questions: formatted });
}))

export default router

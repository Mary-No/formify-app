import { z } from 'zod'

export const QuestionTypeEnum = z.enum([
    'SHORT_TEXT',
    'LONG_TEXT',
    'INTEGER',
    'CHECKBOX',
    'SINGLE_CHOICE'
])

export const TopicEnum = z.enum([
    'TECHNOLOGY',
    'HEALTH',
    'EDUCATION',
    'BUSINESS',
    'ENTERTAINMENT',
    'SCIENCE',
    'LIFESTYLE',
    'ENVIRONMENT',
    'POLITICS',
    'TRAVEL',
    'CULTURE',
    'PERSONAL',
    'RELATIONSHIPS',
    'MARKETING',
    'PRODUCTIVITY',
    'FINANCE',
    'FOOD',
    'SPORT',
    'PSYCHOLOGY',
    'OTHER',
])

export const questionSchema = z.object({
    text: z.string().min(1, 'Text is required'),
    type: QuestionTypeEnum,
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(),
})

export const updateTemplateSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    topic: TopicEnum,
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    questions: z.array(questionSchema).optional(),
})

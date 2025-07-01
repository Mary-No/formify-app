import type {Topic} from "./types/types.ts";

export const QUESTION_TYPES = [
    { label: 'shortText', value: 'SHORT_TEXT' },
    { label: 'longText', value: 'LONG_TEXT' },
    { label: 'number', value: 'INTEGER' },
    { label: 'checkbox', value: 'CHECKBOX' },
    { label: 'singleChoice', value: 'SINGLE_CHOICE' },
]

export const TOPICS: Topic[] = [
    'TECHNOLOGY', 'HEALTH', 'EDUCATION', 'BUSINESS', 'ENTERTAINMENT',
    'SCIENCE', 'LIFESTYLE', 'ENVIRONMENT', 'POLITICS', 'TRAVEL',
    'CULTURE', 'PERSONAL', 'RELATIONSHIPS', 'MARKETING', 'PRODUCTIVITY',
    'FINANCE', 'FOOD', 'SPORT', 'PSYCHOLOGY', 'OTHER'
]
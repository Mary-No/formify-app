import { QuestionInput, QuestionType } from "../types/templates"


const MAX_LIMITS: Record<QuestionType, number> = {
    SHORT_TEXT: 4,
    LONG_TEXT: 4,
    INTEGER: 4,
    CHECKBOX: 4,
    SINGLE_CHOICE: 4
}

export function validateQuestionLimits(questions: QuestionInput[]) {
    const counts: Record<QuestionType, number> = {
        SHORT_TEXT: 0,
        LONG_TEXT: 0,
        INTEGER: 0,
        CHECKBOX: 0,
        SINGLE_CHOICE: 4
    }

    for (const q of questions) {
        counts[q.type]++
    }

    for (const [type, max] of Object.entries(MAX_LIMITS) as [QuestionType, number][]) {
        if (counts[type] > max) {
            throw new Error(`Too many "${type}" questions: ${counts[type]} (max allowed is ${max})`)
        }
    }
}

import { formatDistanceToNow, format } from 'date-fns'
import { enUS, ru, pl } from 'date-fns/locale'

const locales = {
    en: enUS,
    ru,
    pl,
} as const

export function formatTemplateDate(dateStr: string, language: keyof typeof locales = 'en'): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const oneDay = 1000 * 60 * 60 * 24
    const oneWeek = oneDay * 7

    const locale = locales[language] || enUS

    if (diff < oneWeek) {
        return formatDistanceToNow(date, { addSuffix: true, locale })
    }

    return format(date, 'd MMMM yyyy', { locale })
}

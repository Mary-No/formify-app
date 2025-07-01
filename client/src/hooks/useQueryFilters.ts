import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

export function useQueryFilters<T extends Record<string, unknown>>() {
    const [searchParams, setSearchParams] = useSearchParams()

    const getFilters = useCallback(() => {
        const entries = Array.from(searchParams.entries())
        const filters: Partial<Record<keyof T, string | string[]>> = {}

        for (const [key, value] of entries) {
            if (key in filters) {
                const existing = filters[key as keyof T]
                if (Array.isArray(existing)) {
                    existing.push(value)
                } else {
                    filters[key as keyof T] = [existing as string, value]
                }
            } else {
                filters[key as keyof T] = value
            }
        }

        return filters
    }, [searchParams])

    const setFilters = useCallback((filters: Partial<T>) => {
        const newParams = new URLSearchParams()
        for (const key in filters) {
            const value = filters[key]
            if (Array.isArray(value)) {
                value.forEach(v => newParams.append(key, String(v)))
            } else if (value !== undefined && value !== '' && value !== null) {
                newParams.set(key, String(value))
            }
        }
        setSearchParams(newParams)
    }, [setSearchParams])

    const filters = useMemo(() => getFilters(), [getFilters])

    return { filters, setFilters }
}

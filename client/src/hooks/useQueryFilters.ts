import { useSearchParams } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

export function useQueryFilters<T extends Record<string, unknown>>() {
    const [searchParams, setSearchParams] = useSearchParams()

    const getFilters = useCallback(() => {
        const entries = Array.from(searchParams.entries())
        const filters: Record<string, unknown> = {}

        for (const [key, value] of entries) {
            if (key in filters) {
                if (Array.isArray(filters[key])) {
                    filters[key].push(value)
                } else {
                    filters[key] = [filters[key], value]
                }
            } else {
                filters[key] = value
            }
        }

        return filters as T
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

import { notification } from 'antd'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

type ApiError = { error: string }

export function handleApiError(err: unknown, t: (key: string) => string): void {
    const error = err as FetchBaseQueryError | Error

    let description = t('unknownError')

    if (error && typeof error === 'object' && 'status' in error) {
        if (error.data) {
            if (typeof error.data === 'string') {
                description = error.data
            } else if (typeof error.data === 'object' && 'error' in error.data) {
                description = (error.data as ApiError).error
            } else {
                description = t('unknownError')
            }
        } else {
            switch (error.status) {
                case 400: description = t('error400'); break
                case 401: description = t('error401'); break
                case 403: description = t('error403'); break
                case 404: description = t('error404'); break
                case 500: description = t('error500'); break
                default: description = t('unknownError')
            }
        }
    } else if (error instanceof Error) {
        description = error.message
    } else if (typeof error === 'string') {
        description = error
    }

    notification.error({
        message: t('errorTitle'),
        description,
        duration: 5,
    })
}

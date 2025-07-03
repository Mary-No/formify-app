import { useSelector } from 'react-redux'
import NProgress from 'nprogress'
import { useEffect } from 'react'
import type { RootState } from '../app/store'

export const GlobalLoader = () => {
    const isFetching = useSelector((state: RootState) => {
        const queries = state.api.queries
        return Object.values(queries).some(
            (q) => q?.status === 'pending'
        )
    })

    useEffect(() => {
        if (isFetching) NProgress.start()
        else NProgress.done()
    }, [isFetching])

    return null
}

import { useSelector } from 'react-redux'
import NProgress from 'nprogress'
import { useEffect } from 'react'

export const GlobalLoader = () => {
    const isFetching = useSelector((state: any) => {
        const queries = state.api.queries
        return Object.values(queries).some(
            (q: any) => q?.status === 'pending'
        )
    })

    useEffect(() => {
        if (isFetching) NProgress.start()
        else NProgress.done()
    }, [isFetching])

    return null
}

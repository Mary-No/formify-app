import { useRef } from "react"


type UseInfiniteScrollProps = {
    loadMore: () => Promise<void> | void
    hasMore: boolean
    loading: boolean
    threshold?: number
}

export const useInfiniteScroll = ({
                                      loadMore,
                                      hasMore,
                                      loading,
                                      threshold = 50,
                                  }: UseInfiniteScrollProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget
        if (
            hasMore &&
            !loading &&
            target.scrollHeight - target.scrollTop - target.clientHeight < threshold
        ) {
            loadMore()
        }
    }

    return { containerRef, onScroll }
}

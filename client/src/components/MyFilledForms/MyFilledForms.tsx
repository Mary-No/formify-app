import {useEffect, useState } from 'react'
import { List, Spin, Empty, Card } from 'antd'
import { useGetMyFormsQuery } from '../../app/formApi'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import type {MyFormsResponse} from "../../types/types.ts";


export const MyFilledForms = () => {
    const [skip, setSkip] = useState(0)
    const [forms, setForms] = useState<MyFormsResponse["forms"]>([])

    const { data, isLoading, error, isFetching } = useGetMyFormsQuery({ skip })

    useEffect(() => {
        if (data?.forms) {
            if (skip === 0) setForms(data.forms)
            else setForms(prev => [...prev, ...data.forms])
        }
    }, [data, skip])

    const hasMore = data?.forms.length === 20

    const loadMore = () => {
        setSkip(prev => prev + 20)
    }

    const { containerRef, onScroll } = useInfiniteScroll({
        loadMore,
        hasMore,
        loading: isLoading || isFetching,
    })

    if (error) return <div>Error loading forms</div>
    if (isLoading && skip === 0) return <Spin />
    if (forms.length === 0) return <Empty description="No forms found" />

    return (
        <div style={{ height: 400, overflow: 'auto' }} ref={containerRef} onScroll={onScroll}>
            {(isLoading || isFetching) && <Spin style={{ textAlign: 'center', margin: 12 }} />}
            <Card>
            <List
                dataSource={forms}
                renderItem={form => (
                    <List.Item key={form.id}>
                        <div>
                            <strong>{form.template?.title || 'No title'}</strong>
                            <div>{new Date(form.createdAt).toLocaleString()}</div>
                        </div>
                    </List.Item>
                )}
            />
            </Card>
        </div>
    )
}

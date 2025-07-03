import { List, Typography, Avatar, Space } from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../app/hooks.ts'
import { AddCommentForm } from './AddCommentForm/AddCommentForm.tsx'
import { socket } from '../../socket.ts'
import { formatTemplateDate } from '../../utils/formatDate.ts'
import type { Comment } from '../../types/types.ts'
import i18n from '../../i18n'
import s from './Comments.module.scss'

dayjs.extend(relativeTime)

const { Text, Paragraph } = Typography

type Props = {
    comments: Comment[]
    templateId: string
}

export const Comments = ({ comments, templateId }: Props) => {
    const { t } = useTranslation()
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)

    const [localComments, setLocalComments] = useState<Comment[]>(comments)

    const handleNewComment = useCallback((comment: Comment) => {
        setLocalComments(prev => [...prev, comment])
    }, [])

    useEffect(() => {
        setLocalComments(comments)
        socket.connect()
        socket.emit('join-template', templateId)
        socket.on('new-comment', handleNewComment)
        return () => {
            socket.off('new-comment', handleNewComment)
            socket.disconnect()
        }
    }, [comments, templateId, handleNewComment])

    return (
        <div>
            <List
                className={s.list}
                itemLayout="horizontal"
                dataSource={localComments}
                locale={{ emptyText: t('noComments') }}
                renderItem={(comment) => (
                    <List.Item key={comment.id}>
                        <List.Item.Meta
                            avatar={
                                <Avatar style={{ backgroundColor: '#1677ff' }}>
                                    {comment.author.nickname[0].toUpperCase()}
                                </Avatar>
                            }
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space size={8}>
                                        <Text strong>{comment.author.nickname}</Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {formatTemplateDate(comment.createdAt, i18n.language as 'en' | 'ru' | 'pl')}
                                        </Text>
                                    </Space>
                                </div>
                            }
                            description={<Paragraph style={{ marginBottom: 0 }}>{comment.text}</Paragraph>}
                        />
                    </List.Item>
                )}
            />
            {isAuthenticated && <AddCommentForm templateId={templateId} />}
        </div>
    )
}

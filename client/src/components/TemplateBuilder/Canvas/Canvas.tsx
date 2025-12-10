import { useDrop } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import update from 'immutability-helper'
import { DroppedQuestion } from '../DroppedQuestion/DroppedQuestion.tsx'
import type { Question, QuestionType, Topic } from '../../../types/types.ts'
import { Card, Empty, Select, Typography } from 'antd'
import { Input } from 'antd'
import { TOPICS } from '../../../constants'
const { Text } = Typography;
const { Option } = Select
import s from './Canvas.module.scss'
import {useGetTagsQuery} from "../../../app/templateApi.ts";
import {useTranslation} from "react-i18next";
import {MarkdownDescription} from "../MarkdownDescription/MarkdownDescription.tsx";
import type React from 'react';

type DraggedQuestionItem = {
    type: QuestionType
}

type CanvasProps = {
    questions: Question[]
    setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
    title: string
    setTitle: React.Dispatch<React.SetStateAction<string>>
    description: string
    setDescription: React.Dispatch<React.SetStateAction<string>>
    topic: Topic
    setTopic: React.Dispatch<React.SetStateAction<Topic>>
    tags: string[]
    setTags: React.Dispatch<React.SetStateAction<string[]>>
}

export const Canvas = ({ questions, setQuestions, tags, setTags, title, setTitle,description, setDescription, topic, setTopic }: CanvasProps) => {
    const { t } = useTranslation()

    const [, drop] = useDrop<DraggedQuestionItem, void, unknown>({
        accept: 'question-block',
        drop: (item) => {
            const newQuestion: Question = {
                id: uuidv4(),
                templateId: '',
                text: '',
                type: item.type,
                order: questions.length,
                required: false,
                updatedAt: new Date().toISOString(),
            }
            setQuestions((prev) => [...prev, newQuestion])
        },
    })

    const moveCard = (from: number, to: number) => {
        const updated = update(questions, {
            $splice: [
                [from, 1],
                [to, 0, questions[from]],
            ],
        })
        setQuestions(updated)
    }

    const refHandler = (node: HTMLDivElement | null) => {
        drop(node)
    }
    const { data: allTags } = useGetTagsQuery(20)

    return (
        <Card
            ref={refHandler}
            className={s.canvas}
            style={{background: '#fafafa'}}
        >
            <div className={s.defaultBoxes}>
                <Text strong>{t('templateBuilderTitle')}</Text>
                <Input
                    placeholder={t('titlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}

                />
                <Text strong>{t('description')} </Text>
                <MarkdownDescription description={description}
                                      setDescription={setDescription}/>
                <Text strong>{t('topic')}</Text>
                <Select
                    placeholder={t('tagsPlaceholder')}
                    value={topic}
                    onChange={(value) => setTopic(value)}
                    style={{width: '100%'}}
                >
                    {TOPICS.map((topic) => (
                        <Select.Option key={topic} value={topic}>
                            {t(`${topic}`)}
                        </Select.Option>
                    ))}
                </Select>
                <Select
                    mode="tags"
                    style={{ width: '100%', marginTop: 8 }}
                    placeholder={t('enterTags')}
                    value={tags}
                    onChange={(value) => setTags(value)}
                    tokenSeparators={[',', ' ']}
                >
                    {allTags?.map(tag => (
                        <Option key={tag.value} value={tag.value}>{tag.value}</Option>
                    ))}
                </Select>
            </div>

            {questions.length === 0 ? (
                <Empty style={{marginTop: 50}}
                       description={<Text type="secondary">{t('dragHint')}</Text>}
                       image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                questions.map((q, idx) => (
                    <DroppedQuestion
                        key={q.id}
                        question={q}
                        index={idx}
                        moveCard={moveCard}
                        onChange={(updatedFields) => {
                            const updated = [...questions]
                            updated[idx] = {...updated[idx], ...updatedFields}
                            setQuestions(updated)
                        }}
                        onRemove={() =>
                            setQuestions(questions.filter((_, i) => i !== idx))
                        }
                    />
                ))
            )}
        </Card>
    )
}

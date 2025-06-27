import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {Button, message} from 'antd'
import { QuestionBlock } from './QuestionBlock/QuestionBlock.tsx'
import { Canvas } from './Canvas/Canvas.tsx'
import { useCreateTemplateMutation } from '../../app/templateApi'
import s from './TemplateBuilder.module.scss'
import { QUESTION_TYPES } from '../../constants.ts'
import type { Question, Topic } from '../../types/types.ts'
import { useTranslation } from 'react-i18next'
import {handleApiError} from "../../utils/handleApiErrror.ts";
import {useNavigate} from "react-router-dom";


export const TemplateBuilder = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [createTemplate] = useCreateTemplateMutation()
    const [topic, setTopic] = useState<Topic>('OTHER')
    const [questions, setQuestions] = useState<Question[]>([])
    const [tags, setTags] = useState<string[]>([])
    const { t } = useTranslation()
    const navigate = useNavigate()

    const handleSubmit = async () => {
        try {
          await createTemplate({
                title,
                description,
                topic,
                tags,
                isPublic: true,
                questions: questions.map((q) => ({
                    text: q.text,
                    type: q.type,
                    required: q.required,
                })),
            }).unwrap()
            message.success(t('template.created'))
            navigate("/account")
        } catch (error) {
           handleApiError(error, t)
        }
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={s.container}>
                <div className={s.sidebar}>
                    <h2 className={s.heading}>{t('answerType')}</h2>
                    {QUESTION_TYPES.map((q) => (
                        <QuestionBlock key={q.value} type={q.value} />
                    ))}
                </div>
                <div className={s.canvas}>
                    <h2 className={s.heading}>{t('template')}</h2>
                    <Canvas questions={questions} setQuestions={setQuestions} title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            topic={topic}
                            setTopic={setTopic}
                            tags={tags}
                            setTags={setTags}
                    />
                    <Button type="primary" className={s.button} onClick={handleSubmit}>
                        {t('saveTemplate')}
                    </Button>
                </div>
            </div>
        </DndProvider>
    )
}

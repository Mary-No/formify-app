import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {Button, message} from 'antd'
import { QuestionBlock } from './QuestionBlock/QuestionBlock.tsx'
import { Canvas } from './Canvas/Canvas.tsx'
import { useCreateTemplateMutation, useUpdateTemplateMutation } from '../../app/templateApi'
import s from './TemplateBuilder.module.scss'
import { QUESTION_TYPES } from '../../constants.ts'
import type { Question, Topic } from '../../types/types.ts'
import { useTranslation } from 'react-i18next'
import {handleApiError} from "../../utils/handleApiErrror.ts";
import {useNavigate} from "react-router-dom";

type TemplateBuilderProps = {
    editMode?: boolean;
    initialData?: {
        id: string;
        title: string;
        description: string;
        topic: Topic;
        tags: string[];
        questions: Question[];
        isPublic: boolean;
    };
};

export const TemplateBuilder = ({ editMode = false, initialData }: TemplateBuilderProps) => {
    const [title, setTitle] = useState(initialData?.title ?? '');
    const [description, setDescription] = useState(initialData?.description ?? '');
    const [topic, setTopic] = useState<Topic>(initialData?.topic ?? 'OTHER');
    const [questions, setQuestions] = useState<Question[]>(initialData?.questions ?? []);
    const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
    const [isPublic] = useState(initialData?.isPublic ?? true);

    const { t } = useTranslation()
    const navigate = useNavigate()

    const [createTemplate] = useCreateTemplateMutation()
    const [updateTemplate] = useUpdateTemplateMutation();

    const handleSubmit = async () => {
        try {
            const hasEmptyQuestions = questions.some(q => !q.text.trim());

            if (hasEmptyQuestions) {
                message.error(t('fillOrRemoveEmptyQuestions'));
                return;
            }

            const payload = {
                title,
                description,
                topic,
                tags,
                isPublic,
                questions: questions.map((q) => ({
                    text: q.text,
                    type: q.type,
                    required: q.required,
                })),
            };

            if (editMode && initialData?.id) {
                await updateTemplate({ id: initialData.id, data: payload }).unwrap();
                message.success(t('template.updated'));
            } else {
                await createTemplate(payload).unwrap();
                message.success(t('template.created'));
            }

            navigate("/account");
        } catch (error) {
            handleApiError(error, t);
        }
    };


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

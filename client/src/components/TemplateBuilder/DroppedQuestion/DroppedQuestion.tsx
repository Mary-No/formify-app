import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Card, Input, Select, Checkbox, Button } from 'antd'
import { type Question, type QuestionType } from '../../../types/types.ts'
import { QUESTION_TYPES } from '../../../constants.ts'
import { CloseOutlined } from '@ant-design/icons'
import s from './DroppedQuestion.module.scss'
import {useTranslation} from "react-i18next";

type DroppedQuestionProps = {
    question: Question
    index: number
    moveCard: (from: number, to: number) => void
    onChange: (updatedFields: Partial<Question>) => void
    onRemove: () => void
}

export const DroppedQuestion = ({
                                    question,
                                    index,
                                    moveCard,
                                    onChange,
                                    onRemove,
                                }: DroppedQuestionProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const { t } = useTranslation()

    const [, drop] = useDrop<{ index: number }, void, unknown>({
        accept: 'question',
        hover(item, monitor) {
            if (!ref.current) return
            const dragIndex = item.index
            const hoverIndex = index
            if (dragIndex === hoverIndex) return

            const hoverBoundingRect = ref.current.getBoundingClientRect()
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            const clientOffset = monitor.getClientOffset()
            if (!clientOffset) return
            const hoverClientY = clientOffset.y - hoverBoundingRect.top

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

            moveCard(dragIndex, hoverIndex)
            item.index = hoverIndex
        },
    })

    const [{ isDragging }, drag] = useDrag({
        type: 'question',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    drag(drop(ref))

    return (
        <Card
            ref={ref}
            size="small"
            className={s.card}
            style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
        >
            <Input
                className={s.input}
                placeholder={t('questionText')}
            value={question.text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ text: e.target.value })}
        />
            <Select
                options={QUESTION_TYPES.map(({ label, value }) => ({
                    label: t(label),
                    value,
                }))}
                value={question.type}
                onChange={(value: QuestionType) => onChange({ type: value })}
                className={s.select}
            />
            <Checkbox
                checked={question.required}
                onChange={(e) => onChange({ required: e.target.checked })}
            >
                {t('required')}
            </Checkbox>

            <div><Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={onRemove}
                className={s.removeBtn}
                title={t('removeQuestion')}
            />
            </div>

        </Card>
    )
}

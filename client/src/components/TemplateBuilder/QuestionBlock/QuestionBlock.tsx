import { useDrag } from 'react-dnd'
import { useRef } from 'react'
import { Card } from 'antd'
import { QUESTION_TYPES } from '../../../constants'
import {useTranslation} from "react-i18next";

type QuestionBlockProps = { type: string }

export const QuestionBlock = ({ type }: QuestionBlockProps) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'question-block',
        item: { type },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }))
    const { t } = useTranslation()
    const ref = useRef<HTMLDivElement>(null)
    drag(ref)
    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <Card
                hoverable
                size="small"
                style={{ marginBottom: 12, cursor: 'move' }}
            >
                {t(QUESTION_TYPES.find((q) => q.value === type)?.label || '')}
            </Card>
        </div>
    )
}

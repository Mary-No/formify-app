import { Card } from 'antd'
import { useNavigate} from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatTemplateDate } from '../../../utils/formatDate.ts'
import s from './TemplateCard.module.scss'
import { truncateWords } from '../../../utils/truncateWords.ts'
import type {Template} from "../../../types/types.ts";
import {Likes} from "../../Likes/Likes.tsx";

type Props = {
    template: Template
}

const { Meta } = Card;

export const TemplateCard = ({ template }: Props) => {
    const { i18n } = useTranslation()
    const navigate = useNavigate()
    return (

        <Card
            hoverable
            className={s.card}
            actions={[
                <div key="likes"
                     className={s.bottomPart}
                     >
                    <Likes templateId={template.id} likesCount={template.likesCount} likedByUser={template.likedByUser} size="small"/>

                    <div  style={{marginRight: 20}}>{formatTemplateDate(template.createdAt, i18n.language as 'en' | 'ru' | 'pl')}</div>
                </div>
            ]}
            onClick={()=>navigate(`/templates/${template.id}`)}
        >
                    <Meta
                        title={<div style={{ whiteSpace: 'normal' }}>{truncateWords(template.title, 6)}</div>}
                        description={template.author?.nickname}
                    />
           <p className={s.description}>{truncateWords(template.description, 15)}</p>
        </Card>

    );
};


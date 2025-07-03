import {Card} from "antd";
import s from "./TemplateSearchCard.module.scss"
import {useTranslation} from "react-i18next";
import {formatTemplateDate} from "../../utils/formatDate.ts";
import i18n from "../../i18n/index.ts";
import type { Template } from "../../types/types.ts";
import {TemplateTag} from "../Tag.tsx";
import {Link} from "react-router-dom";
import {TemplateTopic} from "../Topic.tsx";
import {Likes} from "../Likes.tsx";
import { TemplateActionsMenu } from "../TemplateActionsMenu.tsx";

type Props={
    item: Template
}
export const TemplateSearchCard = ({item}:Props) => {
    const { t } = useTranslation()

    return <Card className={s.card} key={item.id} title={
            <div className={s.header}>
               <Link to={`/templates/${item.id}`} className={s.cardLink}>
                    <h3 className={s.title}>{item.title}</h3>
                </Link>
                <div className={s.menuAndDate}>
                    <div className={s.date}>{formatTemplateDate(item.createdAt, i18n.language as 'en' | 'ru' | 'pl')}</div>
                    <TemplateActionsMenu item={item} />
                </div>
            </div>
        }>
        <Link to={`/templates/${item.id}`} className={s.cardLink}>
            <TemplateTopic topic={item.topic}/>
            <div className={s.author}>
                {t("author")}: {item.author.nickname}
            </div>
            <p dangerouslySetInnerHTML={{__html: item.description}}/>
            <div className={s.tagsAndLikes}>
                <TemplateTag tags={item.tags}/>
                <Likes templateId={item.id} likesCount={item.likesCount} likedByUser={item.likedByUser} size="small"/>
            </div>
        </Link>
    </Card>
}
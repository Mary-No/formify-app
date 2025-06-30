import {Card} from "antd";
import s from "./TemplateSearchCard.module.scss"
import {useTranslation} from "react-i18next";
import {formatTemplateDate} from "../../utils/formatDate.ts";
import i18n from "../../i18n/index.ts";
import type { Template } from "../../types/types.ts";
import {TemplateTag} from "../Tag/Tag.tsx";
import {Link, useNavigate} from "react-router-dom";
import {TemplateTopic} from "../Topic/Topic.tsx";
import {Likes} from "../Likes/Likes.tsx";
import {ActionMenu} from "../ActionMenu/ActionMenu.tsx";
import {useAppSelector} from "../../app/hooks.ts";
import { useDeleteTemplateMutation } from "../../app/templateApi.ts";
import { useGetMyFormsQuery } from "../../app/formApi.ts";

type Props={
    item: Template
}
export const TemplateSearchCard = ({item}:Props) => {
    const { t } = useTranslation()
    const user = useAppSelector(state => state.auth.user);
    const isAuthor = user?.id === item.author.id
    const navigate = useNavigate()
    const [deleteTemplate, { isLoading }] = useDeleteTemplateMutation()
    const { refetch } = useGetMyFormsQuery({ skip: 0 });

    return <Card className={s.card} key={item.id} title={
            <div className={s.header}>
                <Link to={`/templates/${item.id}`} className={s.cardLink}>
                <h3 className={s.title}>{item.title}</h3>
                </Link>
                <div className={s.menuAndDate}>
                    <div className={s.date}>{formatTemplateDate(item.createdAt, i18n.language as 'en' | 'ru' | 'pl')}</div>
                    { (isAuthor || user?.isAdmin) && <ActionMenu
                        onEdit={() => navigate(`/edit-template/${item.id}`)}
                        onDelete={async () => {
                            await deleteTemplate(item.id).unwrap()
                            refetch()
                        }}
                        onStats={()=> navigate(`/statistic/${item.id}`, {
                                state: {
                                    title: item.title,
                                    description: item.description,
                                }
                            }
                        )}
                        loading={isLoading}
                    />}
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
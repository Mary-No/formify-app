import {Card, Descriptions, List, Typography, Divider, Tooltip, Button, Grid} from 'antd'
import {Comments} from "../Comment/Comments.tsx";
import {Likes} from "../Likes.tsx";
import type {TemplateDetailResponse} from "../../types/types.ts";
import {TemplateTag} from "../Tag.tsx";
import s from "./TemplateDetails.module.scss"
import {TemplateTopic} from "../Topic.tsx";
import {useTranslation} from "react-i18next";
import {formatTemplateDate} from "../../utils/formatDate.ts";
import i18n from "../../i18n";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";
import {useAppSelector} from "../../app/hooks.ts";
import { Image } from 'antd'
import {TemplateActionsMenu} from "../TemplateActionsMenu.tsx";

const { Title } = Typography
const { useBreakpoint } = Grid;

type Props = {
    data:TemplateDetailResponse
}
export const TemplateDetails = ({data}:Props) => {
    const {
        template,
        likesCount,
        likedByUser,
    } = data
    const { t } = useTranslation()
    const navigate = useNavigate()
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const screens = useBreakpoint();
    return (
        <Card className={s.card}>
            <div className={s.title}>
                <Title className={s.title_text}>{template.title}</Title>
                {isAuthenticated && <div className={s.buttons}>
                    {screens.lg &&
                        <Button
                    onClick={() => navigate(`/fill-form/${template.id}`)}
                    type="primary"
                >
                    {t('fillForm')}
                </Button>
                    }
                    <TemplateActionsMenu item={template}/>
                </div>}
            </div>
            {isAuthenticated && !screens.lg && <Button
                onClick={() => navigate(`/fill-form/${template.id}`)}
                type="primary"
                style={{marginBottom:20}}
            >
                {t('fillForm')}
            </Button>}

                <Descriptions className={s.descriptions} column={1} bordered size="small">
                <Descriptions.Item label={t('author')}>{template.author.nickname}</Descriptions.Item>
                <Descriptions.Item label={t('created')}>
                    <Tooltip placement="right" title={dayjs(template.createdAt).format('DD-MM-YYYY HH:mm')}>
                    {formatTemplateDate(template.createdAt,  i18n.language as 'en' | 'ru' | 'pl')}
                    </Tooltip>
                </Descriptions.Item>
                <Descriptions.Item label={t('topic')}> <TemplateTopic topic={template.topic}/></Descriptions.Item>
                <Descriptions.Item label={t('description')}>
                    <div
                        dangerouslySetInnerHTML={{__html: template.description}}
                    />
                </Descriptions.Item>
                <Descriptions.Item className={s.tags} label={t('tags')}>
                    <TemplateTag tags={template.tags}/>
                </Descriptions.Item>
            </Descriptions>
            <Likes templateId={template.id} likesCount={likesCount} likedByUser={likedByUser} size="big"/>

            <Divider orientation="left">{t('questions')}</Divider>
            <List
                dataSource={template.questions}
                renderItem={(q) => (
                    <List.Item style={{display: 'flex', justifyContent: 'center'}} key={q.id}>
                        {q.imageUrl ? (<Image width={300} src={q.imageUrl} alt="Image"/>) : (
                            <List.Item.Meta
                                title={`Q${q.order + 1}: ${q.text}`}
                            />
                        )}
                    </List.Item>
                )}
            />

            <Divider orientation="left">{t('comments')}</Divider>
            <Comments comments={template.comments} templateId={template.id}/>
        </Card>
    )
}

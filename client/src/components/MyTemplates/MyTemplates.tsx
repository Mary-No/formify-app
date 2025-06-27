import {Empty, List, Spin} from "antd";
import {TemplateSearchCard} from "../TemplateSearchCard/TemplateSearchCard.tsx";
import {useTranslation} from "react-i18next";
import { useSearchTemplatesQuery } from "../../app/templateApi.ts";
import s from './MyTemplates.module.scss'

export const MyTemplates = () => {
    const { data, isLoading, error } = useSearchTemplatesQuery({ mine: true })

    const { t } = useTranslation()
    if (error) return <div>{t('myTemplates.error')}</div>
    if (isLoading) return <Spin />
    if (!data || data.templates.length === 0) {
        return <Empty description={t('myTemplates.empty')} />
    }

    return (
        <div className={s.container}>
        <List
            dataSource={data.templates}
            renderItem={(item) => <TemplateSearchCard item={item} />}
        />
        </div>
    )
}

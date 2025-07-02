import { useParams } from "react-router-dom"
import { TemplateDetails } from "../components/TemplateDetails/TemplateDetails"
import { useGetTemplateQuery } from "../app/templateApi"
import { Spin } from "antd"
import {useTranslation} from "react-i18next";

export const TemplatePage = () => {
    const { templateId } = useParams()
    const { data, isLoading, error } = useGetTemplateQuery(templateId!)
    const { t } = useTranslation()
    if (isLoading) return <Spin/>
    if (error || !data) return <div>{t("templateNotFound")}</div>

    return <TemplateDetails data={data}/>
}
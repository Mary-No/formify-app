import { useParams } from "react-router-dom"
import { TemplateDetails } from "../components/TemplateDetails/TemplateDetails"
import { useGetTemplateQuery } from "../app/templateApi"
import { Spin } from "antd"

export const TemplatePage = () => {
    const { templateId } = useParams()
    const { data, isLoading, error } = useGetTemplateQuery(templateId!)
    if (isLoading) return <Spin/>
    if (error || !data) return <div>Template not found</div>

    return <TemplateDetails data={data}/>
}
import { Spin } from "antd";
import { useParams } from "react-router-dom";
import { useGetTemplateQuery } from "../app/templateApi";
import TemplateBuilder  from "./TemplateBuilder/TemplateBuilder";
import {useTranslation} from "react-i18next";

const TemplateEditor = () => {
    const { templateId } = useParams();
    const { data, isLoading, error } = useGetTemplateQuery(templateId!);
    const { t } = useTranslation();
    if (isLoading) return <Spin />;
    if (error || !data) return <div className="templateNotFound">{t('templateNotFound')} </div>;

    return (
        <TemplateBuilder
            editMode
            initialData={{
                id: data.template.id,
                title: data.template.title,
                description: data.template.description,
                topic: data.template.topic,
                tags: data.template.tags.map(tag => tag.name),
                questions: data.template.questions,
                isPublic: data.template.isPublic,
            }}
        />
    );

}
export default TemplateEditor;
import { Spin } from "antd";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FillFormPage } from "../pages/FillFormPage/FillFormPage.tsx";
import { useGetFormByIdQuery } from "../app/formApi.ts";

export const FormEditor = () => {
    const { formId } = useParams<{ formId: string }>();
    const { t } = useTranslation();

    const { data, isLoading, error } = useGetFormByIdQuery(formId!);
    if (isLoading) return <Spin />;
    if (!data || error) {return <div className="templateNotFound">{t('templateNotFound')}</div>}
    const existingAnswers = data.answers.reduce((acc, answer) => {
        acc[answer.questionId] = answer.value;
        return acc;
    }, {} as Record<string, string | number | boolean>);

    return (
        <FillFormPage
            isEdit
            existingAnswers={existingAnswers}
            formId={formId}
            templateId={data.templateId}
        />
    );
};

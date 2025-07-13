import {useNavigate, useParams} from 'react-router-dom';
import {Card, Typography, Spin, message} from 'antd';
import { useTranslation } from 'react-i18next';
import { useSubmitFormMutation, useUpdateFormMutation } from '../app/formApi';
import { handleApiError } from '../utils/handleApiErrror.ts';
import s from "../components/TemplateDetails/TemplateDetails.module.scss";
import { useGetTemplateQuery } from '../app/templateApi.ts';
import { DynamicForm } from '../components/DynamicForm.tsx';


type FillFormPageProps = {
    isEdit?: boolean
    existingAnswers?: Record<string, string | number | boolean>
    formId?: string
    templateId?: string
}

const { Title } = Typography;

export const FillFormPage = ({
                                 isEdit,
                                 existingAnswers,
                                 formId,
                                 templateId: propTemplateId
                             }: FillFormPageProps) => {
    const params = useParams<{ templateId?: string }>();
    const templateId = propTemplateId ?? params.templateId;
    const { t } = useTranslation();
    const [submitForm, { isLoading: isSubmitting }] = useSubmitFormMutation();
    const [updateForm, { isLoading: isUpdating }] = useUpdateFormMutation();
    const navigate = useNavigate();
    const { data, isLoading, error } = useGetTemplateQuery(templateId!);

    if (isLoading) return <Spin />;
    if (error || !data) return <div>{t('templateNotFound')}</div>;

    const { title, description, questions } = data.template;

    const initialValues = questions.reduce((acc, q) => {
        if (q.type === 'CHECKBOX') {
            const existing = existingAnswers?.[q.id];
            acc[q.id] = existing === true || existing === 'true';
        } else if (existingAnswers?.[q.id] !== undefined) {
            acc[q.id] = existingAnswers[q.id];
        }
        return acc;
    }, {} as Record<string, string | number | boolean | undefined>);

    const handleFinish = async (values: Record<string, string | number | boolean>) => {
        const answers = Object.entries(values).map(([questionId, value]) => ({
            questionId,
            value: typeof value === 'boolean' ? String(value) : value,
        }));

        try {
            if (isEdit) {
                if (!formId || !templateId) return;
                await updateForm({ formId, answers, templateId }).unwrap();
                message.success(t('formUpdated'));
            } else {
                if (!templateId) return;
                await submitForm({ templateId, answers }).unwrap();
                message.success(t('formSubmitted'));
            }
            navigate("/account");
        } catch (err) {
            handleApiError(err, t);
        }
    };

    return (
        <Card className={s.card}>
            <Title level={2}>{title}</Title>
            <p dangerouslySetInnerHTML={{ __html: description }} />
            <DynamicForm
                questions={questions}
                initialValues={initialValues}
                onFinish={handleFinish}
                isLoading={isSubmitting || isUpdating}
                buttonText={t(isEdit ? 'updateForm' : 'submitForm')}
            />
        </Card>
    );
};

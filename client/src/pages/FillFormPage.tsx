import {useNavigate, useParams} from 'react-router-dom';
import {Form, Input, Button, Checkbox, message, Card, Typography, Spin, Select, Image} from 'antd';
import { useTranslation } from 'react-i18next';
import { useSubmitFormMutation, useUpdateFormMutation } from '../app/formApi';
import { handleApiError } from '../utils/handleApiErrror.ts';
import s from "../components/TemplateDetails/TemplateDetails.module.scss";
import { useGetTemplateQuery } from '../app/templateApi.ts';
import type { Question } from '../types/types.ts';
const { Title } = Typography

type FillFormPageProps = {
    isEdit?: boolean
    existingAnswers?: Record<string, string | number | boolean>
    formId?: string
    templateId?:string
}

export const FillFormPage = ({isEdit, existingAnswers, formId,  templateId: propTemplateId}:FillFormPageProps) => {
    const params = useParams<{ templateId?: string }>();
    const templateId = propTemplateId ?? params.templateId;
    const { t } = useTranslation();
    const [submitForm, {  isLoading: isSubmitting }] = useSubmitFormMutation();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { data, isLoading, error } = useGetTemplateQuery(templateId!);
    const [updateForm, { isLoading: isUpdating }] = useUpdateFormMutation()
    if (isLoading) return <Spin />;
    if (error || !data) return <div>{t('templateNotFound')}</div>;
    const { title, description, questions } = data.template;

    if (!questions) {
        return <div>{t('noQuestions')}</div>;
    }
    const initialValues: Record<string, string | number | boolean | undefined> = questions.reduce(
        (acc, q) => {
            if (q.type === 'CHECKBOX') {
                const existing = existingAnswers?.[q.id];
                acc[q.id] = existing === true || existing === 'true';
            } else if (existingAnswers?.[q.id] !== undefined) {
                acc[q.id] = existingAnswers[q.id];
            }
            return acc;
        },
        {} as Record<string, string | number | boolean | undefined>
    );


    const getRules = (q: Question) => {
        const requiredRule = q.required
            ? [{ required: true, message: t('required') }]
            : [];

        if (q.type === 'CHECKBOX') {
            return q.required
                ? [
                    {
                        validator(_: any, value: boolean) {
                            if (value === true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error(t('required')));
                        },
                    },
                ]
                : [];
        }

        if (q.type === 'INTEGER') {
            return [
                ...requiredRule,
                {
                    validator(_: any, value: any) {
                        if (value === undefined || value === null || value === '') {
                            return Promise.resolve();
                        }
                        const number = Number(value);
                        if (!Number.isInteger(number)) {
                            return Promise.reject(new Error(t('mustBeInteger')));
                        }

                        return Promise.resolve();
                    },
                },
            ];
        }

        return requiredRule;
    };

    const renderFormItem = (q: Question) => {
        switch (q.type) {
            case 'SHORT_TEXT':
                return <Input />;
            case 'LONG_TEXT':
                return <Input.TextArea rows={4} />;
            case 'INTEGER':
                return <Input type="number" />;
            case 'CHECKBOX':
                return (
                    <Checkbox>
                        {q.text}
                    </Checkbox>
                );
            case 'SINGLE_CHOICE':
                return (
                    <Select placeholder={t('selectOption')}>
                        {q.options?.map((opt, idx) => (
                            <Select.Option key={idx} value={opt}>
                                {opt}
                            </Select.Option>
                        ))}
                    </Select>
                );
            case "IMAGE":
                return  <Image width={200} src={q.imageUrl} alt="Image" />
            default:
                return <Input />;
        }
    };


    return (
        <Card bordered className={s.card}>
            <Title level={2}>{title}</Title>
            <p
                dangerouslySetInnerHTML={{__html: description}}
            />
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
            onFinish={async (values: Record<string, string | number | boolean>) => {
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
                        form.resetFields();
                    }
                    navigate("/account");
                } catch (err) {
                    handleApiError(err, t);
                }
            }}
        >
            {questions.map((q) =>
                q.type === 'CHECKBOX' ? (
                    <Form.Item
                        key={q.id}
                        name={q.id}
                        valuePropName="checked"
                        rules={getRules(q)}
                    >
                        <Checkbox>{q.text}</Checkbox>
                    </Form.Item>
                ) : (
                    <Form.Item key={q.id} name={q.id} label={q.text} rules={getRules(q)}>
                        {renderFormItem(q)}
                    </Form.Item>
                )
            )}
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting || isUpdating}>
                    {t(isEdit ? 'updateForm' : 'submitForm')}
                </Button>
            </Form.Item>
        </Form>
        </Card>
    );
};

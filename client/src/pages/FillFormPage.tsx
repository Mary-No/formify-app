import { useParams } from 'react-router-dom';
import {Form, Input, Button, Checkbox, message, Card, Typography, Spin} from 'antd';
import { useTranslation } from 'react-i18next';
import { useSubmitFormMutation } from '../app/formApi';
import { handleApiError } from '../utils/handleApiErrror.ts';
import type { QuestionType } from '../types/types.ts';
import s from "../components/TemplateDetails/TemplateDetails.module.scss";
import { useGetTemplateQuery } from '../app/templateApi.ts';
const { Title, Paragraph } = Typography

type Question = {
    id: string;
    text: string;
    type: QuestionType;
    required: boolean;
};

export const FillFormPage = () => {
    const { templateId } = useParams<{ templateId: string }>();
    const { t } = useTranslation();
    const [submitForm, {  isLoading: isSubmitting }] = useSubmitFormMutation();
    const [form] = Form.useForm();

    const { data, isLoading, error } = useGetTemplateQuery(templateId!);

    if (isLoading) return <Spin />;
    if (error || !data) return <div>{t('templateNotFound')}</div>;
    const { title, description, questions } = data.template;

    if (!questions) {
        return <div>{t('noQuestions')}</div>;
    }

    const getRules = (q: Question) => {
        const requiredRule = q.required
            ? [{ required: true, message: t('fieldRequired') }]
            : [];

        if (q.type === 'CHECKBOX') {
            return q.required
                ? [
                    {
                        validator(_: any, value: boolean) {
                            if (value === true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error(t('fieldRequired')));
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
            default:
                return <Input />;
        }
    };

    return (
        <Card bordered className={s.card}>
            <Title level={2}>{title}</Title>
            <Paragraph>{description}</Paragraph>
        <Form
            form={form}
            layout="vertical"
            onFinish={async (values: Record<string, any>) => {
                if (!templateId) return;
                const answers = Object.entries(values).map(([questionId, value]) => ({
                    questionId,
                    value: typeof value === 'boolean' ? (value ? 'true' : 'false') : value,
                }));

                try {
                    await submitForm({ templateId, answers }).unwrap();
                    message.success(t('formSubmitted'));
                    form.resetFields();
                } catch (err: any) {
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
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                    {t('fillForm')}
                </Button>
            </Form.Item>
        </Form>
        </Card>
    );
};

import { Form, Input, Checkbox, Select, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Question } from '../types/types';


type DynamicFormProps = {
    questions: Question[];
    initialValues?: Record<string, string | number | boolean | undefined>;
    onFinish: (values: Record<string, string | number | boolean>) => void;
    isLoading?: boolean;
    buttonText?: string;
};

export const DynamicForm = ({
                                questions,
                                initialValues,
                                onFinish,
                                isLoading,
                                buttonText
                            }: DynamicFormProps) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();

    const getRules = (q: Question) => {
        const requiredRule = q.required
            ? [{ required: true, message: t('required') }]
            : [];

        if (q.type === 'CHECKBOX') {
            return q.required
                ? [
                    {
                        validator(_: unknown, value: boolean) {
                            if (value) return Promise.resolve();
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
                    validator(_: unknown, value: number) {
                        if (value === undefined || value === null) return Promise.resolve();
                        if (!Number.isInteger(Number(value))) {
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
                return <Checkbox>{q.text}</Checkbox>;
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
            case 'IMAGE':
                return (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img width={300} src={q.imageUrl} alt="Image" />
                    </div>
                );
            default:
                return <Input />;
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={onFinish}
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
                    <Form.Item
                        key={q.id}
                        name={q.id}
                        label={q.text}
                        rules={getRules(q)}
                    >
                        {renderFormItem(q)}
                    </Form.Item>
                )
            )}
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                    {buttonText ?? t('submit')}
                </Button>
            </Form.Item>
        </Form>
    );
};

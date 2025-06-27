import { useState } from 'react';
import { Input, Button, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAddCommentMutation } from '../../app/templateApi';
import {handleApiError} from "../../utils/handleApiErrror.ts";
import s from "./AddCommentForm.module.scss"

type Props = {
    templateId: string;
};

export const AddCommentForm = ({ templateId }: Props) => {
    const { t } = useTranslation();
    const [comment, setComment] = useState('');
    const [addComment, { isLoading }] = useAddCommentMutation();
    const onSubmit = async () => {
        if (!comment.trim()) return;

        try {
            await addComment({ templateId, text: comment.trim() }).unwrap();
            setComment('');
        } catch (error) {
            handleApiError(error, t)
        }
    };

    return (
        <Form onFinish={onSubmit} layout="vertical">
            <Form.Item className={s.addComment} label={t('addCommentLabel')}>
                <Input.TextArea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder={t('addCommentPlaceholder')}
                    disabled={isLoading}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                />
            </Form.Item>
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    disabled={isLoading || comment.trim().length === 0}
                >
                    {t('addCommentButton')}
                </Button>
            </Form.Item>
        </Form>
    );
};

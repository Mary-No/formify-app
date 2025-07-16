import { Form, Input, Button, Typography, message } from 'antd'
import { useTranslation } from 'react-i18next'
import {useGetMeQuery, useLoginMutation } from '../../app/authApi'
import {handleApiError} from "../../utils/handleApiErrror.ts";
import s from "./SignIn.module.scss"
import {GoogleAuthButton} from "../../components/GoogleAuthButton.tsx";
import { setUser } from '../../app/authSlice.ts';
import { useAppDispatch } from '../../app/hooks.ts';
import {useNavigate} from "react-router-dom";

const { Title } = Typography

export const SignIn = () => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [login, { isLoading }] = useLoginMutation()
    const { refetch: refetchMe } = useGetMeQuery();

    const onFinish = async (values: { email: string; password: string }) => {
        try {
            await login(values).unwrap();
            const { data } = await refetchMe();

            if (data?.user && !data.user.isBlocked) {
                dispatch(setUser(data.user));
                message.success(t('loginSuccess'));
                navigate('/');
            } else {
                message.error(t('accountBlocked'));
            }
        } catch (err: any) {
            handleApiError(err, t);
        }
    }

    return (
        <div>
            <div className={s.container}>
                <Title level={2}>{t('title')}</Title>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label={t('email')}
                        name="email"
                        rules={[
                            {required: true, message: t('emailRequired')},
                            {type: 'email', message: t('invalidEmail')},
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label={t('password')}
                        name="password"
                        rules={[{required: true, message: t('passwordRequired')}]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" className={s.button} htmlType="submit" block loading={isLoading}>
                            {t('submit')}
                        </Button>
                    </Form.Item>
                    <GoogleAuthButton/>
                </Form>
            </div>
        </div>

    )
}

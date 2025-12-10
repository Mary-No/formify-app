import { Button, Form, Input, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '../../app/authApi.ts'
import type { RegisterPayload } from '../../types/types.ts'
import { handleApiError } from '../../utils/handleApiError.ts'
import { useTranslation } from 'react-i18next'
import s from "./SignUp.module.scss"
import {GoogleAuthButton} from "../../components/GoogleAuthButton.tsx";

export const SignUp = () => {
    const [registerUser, { isLoading }] = useRegisterMutation()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const onFinish = async (data: RegisterPayload) => {
        try {
            await registerUser(data).unwrap()
            message.success(t('registeredSuccess'))
            navigate('/login')
        } catch (err: any) {
            handleApiError(err, t)
        }
    }

    return (
        <div>
            <div className={s.container}>
                <Typography.Title level={2}>{t('register')}</Typography.Title>
                <Form
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{nickname: '', email: '', password: ''}}
                >
                    <Form.Item
                        label={t('nickname')}
                        name="nickname"
                        rules={[{required: true, message: t('nicknameRequired')}]}
                    >
                        <Input/>
                    </Form.Item>

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
                        rules={[
                            {required: true, message: t('passwordRequired')},
                            {min: 3, message: t('passwordMin')},
                        ]}
                    >
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item >
                        <Button className={s.register}  type="primary" htmlType="submit" loading={isLoading} block>
                            {t('register')}
                        </Button>
                    </Form.Item>

                   <GoogleAuthButton/>
                </Form>
            </div>
        </div>

    )
}

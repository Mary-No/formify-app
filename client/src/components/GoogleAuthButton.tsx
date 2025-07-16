import { Button, Form } from 'antd'
import { FcGoogle } from 'react-icons/fc'
import { useTranslation } from 'react-i18next'

export const GoogleAuthButton = () => {
    const { t } = useTranslation()

    return (
        <Form.Item>
            <Button
                style={{width:'100%'}}
                block
                icon={<FcGoogle style={{ marginRight: 8 }} />}
                onClick={() =>
                    (window.location.href = 'https://formify-app.onrender.com/auth/google')
                }
            >
                {t('registerWithGoogle')}
            </Button>
        </Form.Item>
    )
}

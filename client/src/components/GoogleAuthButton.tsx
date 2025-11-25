import { Button, Form } from 'antd'
import { FcGoogle } from 'react-icons/fc'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useLazyGetMeQuery } from '../app/authApi'
import { setUser } from '../app/authSlice'


export const GoogleAuthButton = () => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const [getMe] = useLazyGetMeQuery()

    const handleGoogleLogin = () => {
        const popup = window.open(
            'https://formify-app.onrender.com/auth/google',
            'googleAuth',
            'width=500,height=600'
        )

        if (!popup) {
            alert('Popup blocked. Please allow popups for this site.')
            return
        }

        const listener = async (event: MessageEvent) => {
            if (event.origin !== 'https://formify-app.onrender.com') return

            const { token } = event.data
            if (!token) return

            localStorage.setItem('accessToken', token)

            try {
                const { data } = await getMe()
                if (data?.user) {
                    dispatch(setUser(data.user))
                }
            } catch (err) {
                console.error('Failed to fetch user after Google login', err)
            }

            window.removeEventListener('message', listener)
            popup.close()
        }

        window.addEventListener('message', listener)
    }

    return (
        <Form.Item>
            <Button
                style={{ width: '100%' }}
                block
                icon={<FcGoogle style={{ marginRight: 8 }} />}
                onClick={handleGoogleLogin}
            >
                {t('registerWithGoogle')}
            </Button>
        </Form.Item>
    )
}

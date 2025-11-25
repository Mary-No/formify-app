import { Button, Form } from 'antd'
import { FcGoogle } from 'react-icons/fc'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useLazyGetMeQuery } from '../app/authApi.ts'
import { setUser } from '../app/authSlice.ts'
import { useRef } from 'react'


export const GoogleAuthButton = () => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const [getMe] = useLazyGetMeQuery()
    const popupRef = useRef<Window | null>(null)

    const handleGoogleLogin = () => {
        // Закрываем предыдущий popup если есть
        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close()
        }

        const popup = window.open(
            'https://formify-app.onrender.com/auth/google',
            'googleAuth',
            'width=500,height=600'
        )

        if (!popup) {
            alert('Popup blocked. Please allow popups for this site.')
            return
        }

        popupRef.current = popup

        const listener = async (event: MessageEvent) => {
            // Проверяем origin сообщения
            if (event.origin !== 'https://formify-app.onrender.com') return

            // Проверяем тип сообщения
            if (event.data.type !== 'oauth-success') return

            const { token } = event.data
            if (!token) return

            try {
                // Сохраняем токен
                localStorage.setItem('accessToken', token)

                // Получаем данные пользователя
                const { data } = await getMe()
                if (data?.user) {
                    dispatch(setUser(data.user))
                }
            } catch (err) {
                console.error('Failed to fetch user after Google login', err)
            } finally {
                // Всегда очищаем listener и закрываем popup
                window.removeEventListener('message', listener)
                if (popupRef.current && !popupRef.current.closed) {
                    popupRef.current.close()
                }
                popupRef.current = null
            }
        }

        // Добавляем обработчик закрытия popup
        const checkPopupClosed = setInterval(() => {
            if (popup.closed) {
                window.removeEventListener('message', listener)
                clearInterval(checkPopupClosed)
                popupRef.current = null
            }
        }, 500)

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
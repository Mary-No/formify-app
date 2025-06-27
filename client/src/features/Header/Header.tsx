import {Button, Layout } from 'antd'
import { Logo } from '../../components/HeaderComponents/Logo/Logo.tsx'
import { GlobalSearchInput } from '../../components/GlobalSearchInput/GlobalSearchInput.tsx'
import { LanguageSelector } from '../../components/HeaderComponents/LanguageSelector/LanguageSelector.tsx'
import {useLocation, useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import s from './Header.module.scss'
import { ThemeToggle } from '../../components/HeaderComponents/ThemeToggle/ThemeToggle.tsx';
import {useLogoutMutation } from '../../app/authApi.ts';
import {handleApiError} from "../../utils/handleApiErrror.ts";
import {useAppDispatch, useAppSelector} from "../../app/hooks.ts";
import { setUser } from '../../app/authSlice.ts';
import {UserAvatar} from "../../components/Avatar/Avatar.tsx";


const { Header: AntHeader } = Layout

export const Header = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { pathname } = useLocation()
    const [logout] = useLogoutMutation()
    const user = useAppSelector(state => state.auth.user);
    const showSearchInput = !['/login', '/register'].includes(pathname)

    const handleLogout = async () => {
        try {
            await logout().unwrap()
            dispatch(setUser(null));
            navigate('/')
        } catch (err) {
            handleApiError(err, t)
        }
    }

    return (
        <AntHeader className={s.header}>
            <Logo />
            {showSearchInput && <GlobalSearchInput />}
            <div className={s.buttons} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LanguageSelector />
                <ThemeToggle />
                {user ? (
                    <div className={s.account}>
                        <UserAvatar user={user}/>
                        <Button type="primary" onClick={handleLogout}>
                            {t('logout')}
                        </Button>
                    </div>

                ) : (
                    <>
                        {pathname !== '/register' && (
                            <Button type="link" onClick={() => navigate('/register')}>
                                {t('signUp')}
                            </Button>
                        )}
                        {pathname !== '/login' && (
                            <Button type="primary" onClick={() => navigate('/login')}>
                                {t('signIn')}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </AntHeader>
    )
}


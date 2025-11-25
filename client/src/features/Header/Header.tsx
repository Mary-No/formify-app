import {Button, Grid, Layout} from 'antd'
import { Logo } from '../../components/HeaderComponents/Logo/Logo.tsx'
import { GlobalSearchInput } from '../../components/HeaderComponents/GlobalSearchInput/GlobalSearchInput.tsx'
import { LanguageSelector } from '../../components/HeaderComponents/LanguageSelector/LanguageSelector.tsx'
import {useLocation, useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import s from './Header.module.scss'
import { ThemeToggle } from '../../components/HeaderComponents/ThemeToggle/ThemeToggle.tsx';
import {useLogoutMutation } from '../../app/authApi.ts';
import {handleApiError} from "../../utils/handleApiErrror.ts";
import {useAppDispatch, useAppSelector} from "../../app/hooks.ts";
import { setUser } from '../../app/authSlice.ts';
import {UserAvatar} from "../../components/Avatar.tsx";
import { api } from '../../app/api.ts';
import { SearchOutlined } from '@ant-design/icons';
const { useBreakpoint } = Grid;

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
            localStorage.removeItem('accessToken');
            dispatch(setUser(null));
            dispatch(api.util.resetApiState());
            navigate('/')
        } catch (err) {
            handleApiError(err, t)
        }
    }
    const screens = useBreakpoint();
    return (
        <AntHeader className={s.header}>
            <Logo />
            {showSearchInput && screens.lg && <GlobalSearchInput />}
            <div className={s.buttons} >
                {!screens.lg && (showSearchInput && <Button onClick={()=>navigate('/search')} className={s.searchIcon} icon={<SearchOutlined />}/>)}
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
                            <Button type="link" style={{ display: (!screens.lg && pathname !== '/login')  ? 'none' : "flex" }} className={s.registerBtn} onClick={() => navigate('/register')}>
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


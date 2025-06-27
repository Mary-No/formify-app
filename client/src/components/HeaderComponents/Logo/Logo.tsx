import { useTranslation } from "react-i18next"
import s from './Logo.module.scss'
import { Link } from "react-router-dom"


export const Logo = () =>{

    const { t } = useTranslation()
    return (
        <Link to="/" className={s.logo}>
        {t('siteName')}
        </Link>
    )
}
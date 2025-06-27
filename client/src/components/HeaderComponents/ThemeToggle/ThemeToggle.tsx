import { Tooltip } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import s from './ThemeToggle.module.scss'
import { useTheme } from '../../ThemeProvider.tsx'
import { useTranslation } from 'react-i18next'

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme()
    const { t } = useTranslation()
    const isDark = theme === 'dark'

    return (
        <Tooltip title={t(isDark ? 'lightMode' : 'darkMode')} styles={{
            body: {
                backgroundColor: isDark ? '#ffffff' : '#1f1f1f',
                color: isDark ? '#1f1f1f' : '#ffffff',
            },
        }}>
            <button className={s.toggleBtn} onClick={toggleTheme}>
                {isDark ? (
                    <SunOutlined className={`${s.icon} ${s.rotate}`} />
                ) : (
                    <MoonOutlined className={s.icon} />
                )}
            </button>
        </Tooltip>
    )
}

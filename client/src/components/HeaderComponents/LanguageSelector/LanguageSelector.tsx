import { Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { GlobalOutlined } from '@ant-design/icons'
import s from "./LanguageSelector.module.scss"
import { Grid } from 'antd';

const { Option } = Select
const { useBreakpoint } = Grid;

const languages = [
    { code: 'en', label: '🇬🇧 English' },
    { code: 'ru', label: '🇷🇺 Русский' },
    { code: 'pl', label: '🇵🇱 Polski' },
]

export const LanguageSelector = () => {
    const { i18n } = useTranslation()

    const handleChange = (lng: string) => {
        void i18n.changeLanguage(lng);
        localStorage.setItem('lng', lng)
    }
    const screens = useBreakpoint();
    return (
        <Select
            size="middle"
            value={i18n.language}
            onChange={handleChange}
            suffixIcon={<GlobalOutlined />}
            className={s.select}
        >
            {languages.map(lang => (
                <Option key={lang.code} value={lang.code}>
                    {screens.lg ? (
                        <div className={s.label}>{lang.label}</div>
                    ) : (
                        lang.code
                    )}
                </Option>
            ))}
        </Select>
    )
}

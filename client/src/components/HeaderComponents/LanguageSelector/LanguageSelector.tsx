import { Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { GlobalOutlined } from '@ant-design/icons'
import s from "./LanguageSelector.module.scss"
const { Option } = Select

const languages = [
    { code: 'en', label: '🇬🇧 English' },
    { code: 'ru', label: '🇷🇺 Русский' },
    { code: 'pl', label: '🇵🇱 Polski' },
]

export const LanguageSelector = () => {
    const { i18n } = useTranslation()

    const handleChange = (lng: string) => {
        i18n.changeLanguage(lng)
        localStorage.setItem('lng', lng) // сохранить выбор
    }

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
                    {lang.label}
                </Option>
            ))}
        </Select>
    )
}

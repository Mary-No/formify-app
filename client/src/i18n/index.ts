import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './en.json'
import ru from './ru.json'
import pl from './pl.json'

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'lng',
        },
        interpolation: { escapeValue: false },
        resources: {
            en: { translation: en },
            ru: { translation: ru },
            pl: { translation: pl },
        },
    })

export default i18n

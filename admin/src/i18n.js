import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import fr from './locales/fr/translation.json'
import en from './locales/en/translation.json'
import pt from './locales/pt/translation.json'
import ar from './locales/ar/translation.json'
import es from './locales/es/translation.json'
import sw from './locales/sw/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      pt: { translation: pt },
      ar: { translation: ar },
      es: { translation: es },
      sw: { translation: sw }
    },
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n

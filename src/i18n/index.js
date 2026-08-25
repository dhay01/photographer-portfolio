import { createI18n } from 'vue-i18n'
import en from './en.json'
import ar from './ar.json'

/**
 * Interface chrome only — button labels, section headings, field names. Everything
 * that is *content* (photography, prose, workshop details) comes from the API, so
 * the photographer edits it in the dashboard rather than in this file.
 *
 * Arabic keys exist but are empty; `fallbackLocale` means an untranslated key
 * renders in English instead of blank.
 */
/**
 * The locales the interface can present, in the order the switcher shows them.
 * `label` is what appears in the navbar; `native` is for accessible names.
 */
export const LOCALES = [
  { code: 'en', label: 'EN', native: 'English', dir: 'ltr' },
  { code: 'ar', label: 'ع', native: 'العربية', dir: 'rtl' },
]

export const SUPPORTED_LOCALES = LOCALES.map((locale) => locale.code)

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  // The ar.json scaffold is intentionally empty; don't warn on every miss.
  missingWarn: false,
  fallbackWarn: false,
  messages: { en, ar },
})

export const currentLocale = () => i18n.global.locale.value

export const setLocale = (locale) => {
  if (!SUPPORTED_LOCALES.includes(locale)) return
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
}

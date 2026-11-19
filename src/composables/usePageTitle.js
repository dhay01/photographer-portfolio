import { watchEffect } from 'vue'

export const SITE_NAME = 'Ghaith Salih'

/** "About · Ghaith Salih", or just the site name when the page has none. */
export const formatTitle = (name) => (name?.trim() ? `${name.trim()} · ${SITE_NAME}` : SITE_NAME)

/**
 * Keeps the tab title in step with the page. `getName` is re-read whenever what it
 * touches changes — content arriving, or the visitor switching language.
 */
export const usePageTitle = (getName = () => '') =>
  watchEffect(() => {
    document.title = formatTitle(getName())
  })

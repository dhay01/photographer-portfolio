import { currentLocale } from '../i18n'

/**
 * Dates arrive from the API as ISO strings so they can be sorted and filtered
 * server-side; the site displays them as "Feb 2026". Formatting happens here
 * rather than in the database so the same row renders correctly in either locale.
 */
export const monthYear = (iso) => {
  if (!iso) return ''

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(currentLocale(), {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** "14–15 March 2026", or a single day when the workshop is one day long. */
export const workshopDates = (workshop) => {
  if (!workshop?.starts_on) return ''

  const start = new Date(workshop.starts_on)
  const end = workshop.ends_on ? new Date(workshop.ends_on) : null
  const locale = currentLocale()
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(start)

  if (end && end.getTime() !== start.getTime()) {
    return `${start.getDate()}–${end.getDate()} ${month} ${start.getFullYear()}`
  }

  return `${start.getDate()} ${month} ${start.getFullYear()}`
}

/** "14 Mar" — the compact form used in the schedule list. */
export const shortDate = (workshop) => {
  if (!workshop?.starts_on) return ''

  const start = new Date(workshop.starts_on)
  const month = new Intl.DateTimeFormat(currentLocale(), { month: 'short' }).format(start)

  return `${String(start.getDate()).padStart(2, '0')} ${month}`
}

export const monthName = (monthIndex, year = 2026) =>
  new Intl.DateTimeFormat(currentLocale(), { month: 'long' }).format(new Date(year, monthIndex, 1))

/** Splits an ISO date into the calendar's year/month/day parts. */
export const dateParts = (iso) => {
  const date = new Date(iso)

  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }
}

/** Money for display: the API sends minor units plus a currency code. */
export const price = (workshop) => {
  if (!workshop) return ''

  return new Intl.NumberFormat(currentLocale(), {
    style: 'currency',
    currency: workshop.currency ?? 'USD',
    maximumFractionDigits: 0,
  }).format((workshop.price_minor ?? 0) / 100)
}

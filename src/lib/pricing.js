/**
 * The session-price calculator from the workshop spreadsheet
 * (حاسبة التسعير للمصورين.xlsx), as plain functions so the page only renders.
 *
 *   gear:     price ÷ years ÷ 12                  → what to put aside each month
 *   monthly:  expenses − fixed income + gear      → what working costs a month
 *   session:  (cost + salary) × (1 + profit) ÷ sessions, rounded up to 5,000
 *
 * Nothing is stored or sent anywhere; every value lives in the visitor's tab.
 */

export const ROUND_TO = 5000
const MONTHS = 12

export const ENTRY_EXPENSE = 'expense'
export const ENTRY_INCOME = 'income'

const positive = (value) => (Number.isFinite(value) && value > 0 ? value : 0)

/** Monthly depreciation of one item. Matches the sheet's IF(AND(B>0,C>0),B/C,0)/12. */
export const gearMonthly = ({ price, years }) => {
  const cost = positive(price)
  const life = positive(years)
  return cost && life ? cost / life / MONTHS : 0
}

export const gearTotals = (items) => ({
  price: items.reduce((sum, item) => sum + positive(item.price), 0),
  monthly: items.reduce((sum, item) => sum + gearMonthly(item), 0),
})

/** SUMIF over the type column: expenses add, fixed income (e.g. gear rental) subtracts. */
export const monthlyTotals = (entries) => {
  const sumOf = (type) =>
    entries.filter((e) => e.type === type).reduce((sum, e) => sum + positive(e.amount), 0)

  const expenses = sumOf(ENTRY_EXPENSE)
  const income = sumOf(ENTRY_INCOME)

  return { expenses, income, net: expenses - income }
}

/**
 * CEILING(value, step). Rounded to the fils first, so a float like
 * 240000.00000001 does not jump a whole step. Never below zero: a negative
 * floor would mean the business pays the client.
 */
export const roundUp = (value, step = ROUND_TO) => {
  if (!(value > 0)) return 0
  return Math.ceil(Math.round(value * 100) / 100 / step) * step
}

export const sessionPrice = ({ gear, entries, salary, profitRate, sessions }) => {
  const gearShare = gearTotals(gear).monthly
  const monthly = monthlyTotals(entries)
  const workCost = monthly.net + gearShare
  const base = workCost + positive(salary)
  const profit = base * positive(profitRate)
  const target = base + profit
  const count = positive(sessions)
  const exact = count ? target / count : 0

  return {
    gearShare,
    monthly,
    workCost,
    base,
    profit,
    target,
    exact,
    floor: roundUp(exact),
  }
}

/** The worked example from the workshop ("Ahmed"), used to prefill the page. */
export const SAMPLE = {
  gear: [
    { name: 'كاميرا', price: 3000000, years: 4 },
    { name: 'عدستين', price: 3000000, years: 6 },
    { name: 'إضاءة وفلاش', price: 1200000, years: 4 },
    { name: 'لابتوب وشاشة', price: 2400000, years: 3 },
    { name: 'كروت وهاردات', price: 600000, years: 2 },
    { name: 'حقائب وستاندات', price: 600000, years: 3 },
  ],
  entries: [
    { name: 'اشتراكات (Adobe، Claude، تخزين)', amount: 120000, type: ENTRY_EXPENSE },
    { name: 'موبايل وإنترنت', amount: 60000, type: ENTRY_EXPENSE },
    { name: 'نقل وبانزين', amount: 200000, type: ENTRY_EXPENSE },
    { name: 'إعلانات وتسويق', amount: 150000, type: ENTRY_EXPENSE },
    { name: 'احتياطي صيانة', amount: 70000, type: ENTRY_EXPENSE },
    { name: 'موقع ودومين', amount: 30000, type: ENTRY_EXPENSE },
    { name: 'كهرباء ومولدة (حصة الشغل)', amount: 50000, type: ENTRY_EXPENSE },
  ],
  salary: 1500000,
  profitRate: 0.2,
  sessions: 12,
}

// Arabic-Indic (U+0660) and Persian (U+06F0) digits each run 0–9 in order.
const toWesternDigit = (d) => String(d.charCodeAt(0) & 0xf)

/**
 * What a visitor types into a money or count field, as a number. Accepts
 * Arabic-Indic digits and thousands separators; anything else is dropped.
 */
export const parseAmount = (text) => {
  const western = String(text ?? '')
    .replace(/[٠-٩۰-۹]/g, toWesternDigit)
    .replace('٫', '.')
  const digits = western.replace(/[^\d.]/g, '')
  const value = Number.parseFloat(digits)
  return Number.isFinite(value) ? value : 0
}

const grouped = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** 245000 → "245,000". Western digits, as on the workshop slides. */
export const money = (value) => grouped.format(Math.round(value || 0))

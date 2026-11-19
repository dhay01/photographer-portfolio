import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ENTRY_EXPENSE,
  ENTRY_INCOME,
  SAMPLE,
  gearMonthly,
  gearTotals,
  monthlyTotals,
  money,
  parseAmount,
  roundUp,
  sessionPrice,
} from './pricing.js'

test('the workshop example lands on the spreadsheet figures', () => {
  const result = sessionPrice(SAMPLE)

  assert.equal(Math.round(result.gearShare), 237500)
  assert.equal(result.monthly.net, 680000)
  assert.equal(Math.round(result.workCost), 917500)
  assert.equal(Math.round(result.base), 2417500)
  assert.equal(Math.round(result.target), 2901000)
  assert.equal(Math.round(result.exact), 241750)
  assert.equal(result.floor, 245000)
  assert.equal(gearTotals(SAMPLE.gear).price, 10800000)
})

test('an item with no price or no lifespan costs nothing a month', () => {
  assert.equal(gearMonthly({ price: 1200000, years: 0 }), 0)
  assert.equal(gearMonthly({ price: 0, years: 4 }), 0)
  assert.equal(gearMonthly({ price: -5, years: 4 }), 0)
  assert.equal(gearMonthly({ price: 1200000, years: 4 }), 25000)
})

test('fixed income is taken off the monthly expenses', () => {
  const totals = monthlyTotals([
    { amount: 300000, type: ENTRY_EXPENSE },
    { amount: 100000, type: ENTRY_INCOME },
  ])
  assert.deepEqual(totals, { expenses: 300000, income: 100000, net: 200000 })
})

test('rounding goes up to the next 5,000 and never below zero', () => {
  assert.equal(roundUp(240000), 240000)
  assert.equal(roundUp(240000.000001), 240000)
  assert.equal(roundUp(240001), 245000)
  assert.equal(roundUp(-10), 0)
  assert.equal(roundUp(Number.NaN), 0)
})

test('zero sessions gives no price rather than Infinity', () => {
  const result = sessionPrice({ ...SAMPLE, sessions: 0 })
  assert.equal(result.exact, 0)
  assert.equal(result.floor, 0)
})

test('typed amounts accept separators and Arabic-Indic digits', () => {
  assert.equal(parseAmount('3,000,000'), 3000000)
  assert.equal(parseAmount('٣٠٠٠٠٠٠'), 3000000)
  assert.equal(parseAmount('۱۲'), 12)
  assert.equal(parseAmount('abc'), 0)
  assert.equal(parseAmount(''), 0)
  assert.equal(money(241750.4), '241,750')
})

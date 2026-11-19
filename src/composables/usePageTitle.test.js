import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SITE_NAME, formatTitle } from './usePageTitle.js'

test('puts the page name before the site name', () => {
  assert.equal(formatTitle('About'), `About · ${SITE_NAME}`)
  assert.equal(formatTitle('  حاسبة السعر '), `حاسبة السعر · ${SITE_NAME}`)
})

test('falls back to the site name alone when the page has no name yet', () => {
  assert.equal(formatTitle(''), SITE_NAME)
  assert.equal(formatTitle(undefined), SITE_NAME)
  assert.equal(formatTitle(null), SITE_NAME)
  assert.equal(formatTitle('   '), SITE_NAME)
})

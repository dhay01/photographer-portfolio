// Lives under src/ because every file in functions/ becomes a Pages route.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { onRequest } from '../../functions/assets/_middleware.js'

const serve = (body, type) => () => new Response(body, { headers: { 'Content-Type': type } })

test('a missing asset answered with the SPA page becomes an uncacheable 404', async () => {
  const res = await onRequest({ next: serve('<!doctype html>', 'text/html; charset=utf-8') })

  assert.equal(res.status, 404)
  assert.equal(res.headers.get('Cache-Control'), 'no-store')
})

test('a real asset passes through untouched', async () => {
  const original = serve('body{}', 'text/css; charset=utf-8')()
  const res = await onRequest({ next: () => original })

  assert.equal(res, original)
})

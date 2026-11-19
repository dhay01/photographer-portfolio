import { test } from 'node:test'
import assert from 'node:assert/strict'
import { RELOAD_COOLDOWN_MS, isChunkError, reloadOnce } from './staleBuild.js'

const fakeEnv = () => {
  const store = new Map()
  const visited = []
  return {
    visited,
    storage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
    location: { assign: (url) => visited.push(url) },
  }
}

test('recognises each browser’s wording for a missing chunk', () => {
  assert.ok(isChunkError(new TypeError('Failed to fetch dynamically imported module: /assets/x.js')))
  assert.ok(isChunkError(new TypeError('error loading dynamically imported module')))
  assert.ok(isChunkError(new TypeError('Importing a module script failed.')))
  assert.ok(isChunkError(new Error('Unable to preload CSS for /assets/x.css')))
  assert.ok(!isChunkError(new Error('Network down')))
  assert.ok(!isChunkError(undefined))
})

test('reloads once, then holds off until the cooldown passes', () => {
  const env = fakeEnv()

  assert.equal(reloadOnce('/pricing', { ...env, now: 1000 }), true)
  assert.equal(reloadOnce('/pricing', { ...env, now: 1000 + RELOAD_COOLDOWN_MS - 1 }), false)
  assert.equal(reloadOnce('/blog', { ...env, now: 1000 + RELOAD_COOLDOWN_MS }), true)
  assert.deepEqual(env.visited, ['/pricing', '/blog'])
})

test('still reloads when storage is unavailable', () => {
  const env = fakeEnv()
  const broken = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  }

  assert.equal(reloadOnce('/', { ...env, storage: broken }), true)
  assert.deepEqual(env.visited, ['/'])
})

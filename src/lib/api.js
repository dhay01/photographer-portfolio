const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/**
 * Thrown for any non-2xx response. `errors` carries Laravel's per-field
 * validation bag (422) so the form can highlight the offending questions.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, errors = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

async function request(path, { method = 'GET', body, locale = 'en' } = {}) {
  if (!BASE) {
    throw new ApiError('The API URL is not configured (set VITE_API_URL).')
  }

  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Accept-Language': locale,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.')
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(
      payload.message ?? 'Something went wrong. Please try again.',
      { status: response.status, errors: payload.errors ?? {} },
    )
  }

  return payload
}

export const getWorkshops = (locale) => request('/api/workshops', { locale })

export const getWorkshop = (slug, locale) => request(`/api/workshops/${slug}`, { locale })

export const createReservation = (slug, { answers, seats, locale = 'en' }) =>
  request(`/api/workshops/${slug}/reservations`, {
    method: 'POST',
    locale,
    body: { answers, seats, locale },
  })

import { shallowRef } from 'vue'
import { getReservationQuestions } from '../lib/api'
import { currentLocale } from '../i18n'

/**
 * The intake questions come from the server so the form and the validation rules
 * are generated from one definition — the frontend used to keep its own copy, and
 * the two could drift apart silently.
 *
 * Cached at module scope: the set changes rarely, and the modal is opened and
 * closed repeatedly while browsing the schedule.
 */
const questions = shallowRef([])
const version = shallowRef(null)
const error = shallowRef(null)
let inflight = null

export function useReservationQuestions() {
  if (!inflight) {
    inflight = getReservationQuestions(currentLocale())
      .then((data) => {
        questions.value = data.questions ?? []
        version.value = data.version ?? null
        return questions.value
      })
      .catch((e) => {
        error.value = e
        // Let a later open retry rather than caching the failure.
        inflight = null
        return []
      })
  }

  return { questions, version, error, ready: inflight }
}

/** A blank answer per question: checkboxes collect a list, everything else a string. */
export const blankAnswers = (list) =>
  Object.fromEntries(list.map((q) => [q.id, q.type === 'checkbox' ? [] : '']))

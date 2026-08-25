<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { blankAnswers, useReservationQuestions } from '../composables/useReservationQuestions'
import { price, workshopDates } from '../lib/format'
import { createReservation, ApiError } from '../lib/api'

const props = defineProps({
  course: { type: Object, required: true },
  seats: { type: Number, default: 1 },
})

const emit = defineEmits(['close', 'reserved'])

const { t } = useI18n()
const { questions, error: questionsError } = useReservationQuestions()

// Populated once the question set arrives, and kept in step if it ever changes.
const answers = reactive({})

watch(
  questions,
  (list) => {
    Object.keys(answers).forEach((key) => delete answers[key])
    Object.assign(answers, blankAnswers(list))
  },
  { immediate: true },
)
const seatCount = ref(props.seats)
const confirmed = ref(false)
const showErrors = ref(false)

const submitting = ref(false)
const formError = ref('')
const serverErrors = reactive({})
const result = ref(null)

const isBlank = (q) => {
  const value = answers[q.id]

  return q.type === 'checkbox'
    ? !value?.length
    : String(value ?? '').trim() === ''
}

const missing = computed(() =>
  questions.value.filter((q) => q.required && isBlank(q)).map((q) => q.id),
)

/** Client-side gaps and anything the server rejected, keyed by question id. */
const invalid = computed(() => [
  ...missing.value,
  ...Object.keys(serverErrors),
])

const scrollToFirstError = () =>
  document.querySelector('.rf__field--error')?.scrollIntoView({ block: 'center' })

const submit = async () => {
  showErrors.value = true
  Object.keys(serverErrors).forEach((k) => delete serverErrors[k])
  formError.value = ''

  if (missing.value.length) {
    scrollToFirstError()
    return
  }

  submitting.value = true
  try {
    const response = await createReservation(props.course.slug, {
      answers: { ...answers },
      seats: seatCount.value,
    })

    result.value = response.data
    confirmed.value = true
    emit('reserved', response.data)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error

    // Laravel returns `answers.<questionId>` — map back onto the question ids.
    for (const [field, messages] of Object.entries(error.errors)) {
      const id = field.replace(/^answers\./, '').split('.')[0]
      serverErrors[id] = messages[0]
    }

    formError.value = Object.keys(error.errors).length
      ? t('reserve.checkAnswers')
      : error.message

    await Promise.resolve()
    scrollToFirstError()
  } finally {
    submitting.value = false
  }
}

const onKey = (e) => {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="modal" role="dialog" aria-modal="true" @click.self="emit('close')">
    <div class="modal__panel">
      <button class="modal__close" :aria-label="$t('reserve.close')" @click="emit('close')">&times;</button>

      <template v-if="!confirmed">
        <header class="modal__head">
          <span class="mono modal__kicker">{{ $t('reserve.title') }}</span>
          <h3 class="modal__title">{{ course.title }}</h3>
          <div class="mono modal__sub">
            {{ workshopDates(course) }} &middot; {{ course.location }} &middot;
            {{ price(course) }} {{ $t('reserve.perSeat') }}
          </div>
        </header>

        <p v-if="questionsError" class="mono modal__formerror" role="alert">
          {{ $t('reserve.loadFailed') }}
        </p>

        <form v-else-if="questions.length" class="rf" novalidate @submit.prevent="submit">
          <div
            v-for="q in questions"
            :key="q.id"
            class="rf__field"
            :class="{ 'rf__field--error': showErrors && invalid.includes(q.id) }"
          >
            <label :for="`q-${q.id}`" class="rf__label">
              {{ q.label }}
              <span v-if="q.required" class="rf__req" aria-hidden="true">*</span>
            </label>
            <p v-if="q.hint" class="rf__hint">{{ q.hint }}</p>

            <textarea
              v-if="q.type === 'textarea'"
              :id="`q-${q.id}`"
              v-model="answers[q.id]"
              class="rf__input"
              :rows="q.rows"
            />

            <div v-else-if="q.type === 'radio'" class="rf__choices">
              <label v-for="opt in q.options" :key="opt.value" class="rf__choice">
                <input v-model="answers[q.id]" type="radio" :name="q.id" :value="opt.value" />
                <span>{{ opt.label }}</span>
              </label>
            </div>

            <div v-else-if="q.type === 'checkbox'" class="rf__choices">
              <label v-for="opt in q.options" :key="opt.value" class="rf__choice">
                <input v-model="answers[q.id]" type="checkbox" :value="opt.value" />
                <span>{{ opt.label }}</span>
              </label>
            </div>

            <input
              v-else
              :id="`q-${q.id}`"
              v-model="answers[q.id]"
              class="rf__input"
              :type="q.type"
              :min="q.min"
              :max="q.max"
              :autocomplete="q.autocomplete"
            />

            <p v-if="showErrors && invalid.includes(q.id)" class="mono rf__error">
              {{ serverErrors[q.id] ?? $t('reserve.requiredField') }}
            </p>
          </div>

          <div class="rf__field rf__seats">
            <label for="q-seats" class="rf__label">{{ $t('reserve.seats') }}</label>
            <input id="q-seats" v-model.number="seatCount" class="rf__input" type="number" min="1" max="6" />
          </div>

          <p v-if="formError" class="mono modal__formerror" role="alert">{{ formError }}</p>

          <button type="submit" class="btn btn--solid modal__submit" :disabled="submitting">
            {{ submitting ? $t('reserve.submitting') : $t('reserve.submit') }}
          </button>
          <p class="mono modal__fineprint">{{ $t('reserve.noPayment') }}</p>
        </form>

        <p v-else class="mono modal__loading">{{ $t('common.loading') }}</p>
      </template>

      <div v-else class="modal__done">
        <div class="modal__check">{{ result?.waitlisted ? '⋯' : '✓' }}</div>
        <h3 class="modal__title">
          {{ result?.waitlisted ? $t('reserve.waitlisted') : $t('reserve.reserved') }}
        </h3>
        <p class="modal__done-copy">
          <span class="modal__hl">{{ course.title }}</span>
          {{ result?.waitlisted ? $t('reserve.waitlistedBefore') : $t('reserve.confirmedBefore') }}
        </p>
        <p v-if="result?.reference" class="mono modal__reference">
          {{ $t('reserve.reference', { reference: result.reference }) }}
        </p>
        <button class="btn modal__done-btn" @click="emit('close')">{{ $t('reserve.done') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal__loading {
  padding: 40px 0;
  text-align: center;
  opacity: 0.5;
}

.modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(8, 9, 11, 0.9);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal__panel {
  width: min(560px, 100%);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background: #101216;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: clamp(26px, 3vw, 40px);
  position: relative;
}

.modal__close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: rgba(16, 18, 22, 0.9);
  color: var(--ink);
  cursor: pointer;
  font-size: 17px;
}

.modal__head {
  padding-right: 44px;
}

.modal__kicker {
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

.modal__title {
  margin-top: 12px;
  font-weight: 500;
  font-size: clamp(22px, 2.2vw, 28px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-wrap: pretty;
}

.modal__sub {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 8px;
}

/* ---------- fields ---------- */

.rf {
  margin-top: 28px;
}

.rf__field + .rf__field {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.rf__label {
  display: block;
  font-size: 14.5px;
  font-weight: 400;
  line-height: 1.45;
  text-wrap: pretty;
}

.rf__req {
  color: var(--accent);
  margin-left: 4px;
}

.rf__hint {
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  opacity: 0.45;
}

.rf__input {
  width: 100%;
  margin-top: 12px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 13px 15px;
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 15px;
  outline: none;
  transition: border-color 0.3s ease;
  resize: vertical;
}

.rf__input:focus {
  border-color: var(--accent);
}

.rf__choices {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rf__choice {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 14.5px;
  opacity: 0.88;
  cursor: pointer;
}

.rf__choice input {
  accent-color: var(--accent);
  width: 17px;
  height: 17px;
  flex: none;
  cursor: pointer;
}

.rf__choice:hover {
  opacity: 1;
}

.rf__field--error .rf__input {
  border-color: #d9534f;
}

.rf__error {
  margin-top: 8px;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  color: #e8837f;
}

.rf__seats .rf__input {
  width: 110px;
}

.modal__formerror {
  margin-top: 24px;
  padding: 12px 16px;
  border: 1px solid rgba(217, 83, 79, 0.5);
  border-radius: 10px;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: #e8837f;
  text-align: center;
}

.modal__submit {
  width: 100%;
  margin-top: 28px;
  justify-content: center;
  padding: 16px;
  font-size: 12px;
}

.modal__submit:disabled {
  opacity: 0.55;
  cursor: progress;
}

.modal__reference {
  margin-top: 14px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.5;
}

.modal__fineprint {
  margin-top: 14px;
  font-size: 10px;
  letter-spacing: 0.04em;
  opacity: 0.4;
  text-align: center;
  text-wrap: pretty;
}

/* ---------- confirmation ---------- */

.modal__done {
  text-align: center;
  padding: 12px 0;
}

.modal__check {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 50%;
  border: 1px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 28px;
}

.modal__done .modal__title {
  margin-top: 22px;
}

.modal__done-copy {
  margin-top: 12px;
  font-size: 15px;
  line-height: 1.6;
  font-weight: 300;
  opacity: 0.72;
  text-wrap: pretty;
}

.modal__hl {
  color: var(--accent);
}

.modal__done-btn {
  margin-top: 26px;
}
</style>

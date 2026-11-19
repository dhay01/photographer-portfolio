<script setup>
import { computed, ref } from 'vue'
import { money, parseAmount } from '../lib/pricing'

/**
 * A number typed the way people write money: "3,000,000" or "٣٠٠٠٠٠٠".
 * While focused it shows exactly what was typed, so the caret never jumps;
 * on blur it settles into grouped digits.
 */
const model = defineModel({ type: Number, default: 0 })

defineProps({
  label: { type: String, required: true },
  suffix: { type: String, default: '' },
})

const draft = ref('')
const focused = ref(false)

const shown = computed(() => (focused.value ? draft.value : model.value ? money(model.value) : ''))

const onFocus = () => {
  draft.value = model.value ? String(model.value) : ''
  focused.value = true
}

const onInput = (event) => {
  draft.value = event.target.value
  model.value = parseAmount(draft.value)
}
</script>

<template>
  <label class="amount">
    <span class="sr-only">{{ label }}</span>
    <input
      class="amount__input"
      type="text"
      inputmode="decimal"
      dir="ltr"
      autocomplete="off"
      placeholder="0"
      :value="shown"
      @focus="onFocus"
      @blur="focused = false"
      @input="onInput"
    />
    <span v-if="suffix" class="amount__suffix">{{ suffix }}</span>
  </label>
</template>

<style scoped>
.amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  border-bottom: 1px solid var(--line);
  transition: border-color 0.3s ease;
}

.amount:focus-within {
  border-color: var(--accent);
}

.amount__input {
  flex: 1;
  min-width: 0;
  padding: 10px 0;
  border: none;
  background: transparent;
  color: var(--ink);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  text-align: left;
  outline: none;
}

.amount__input::placeholder {
  color: rgba(242, 240, 234, 0.3);
}

.amount__suffix {
  font-size: 12px;
  opacity: 0.45;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>

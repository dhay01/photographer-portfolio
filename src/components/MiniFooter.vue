<script setup>
import { site } from '../data/site'

defineProps({
  // Left-most link differs per page (journal vs. all courses).
  links: { type: Array, required: true },
})
</script>

<template>
  <footer class="mini-footer mono">
    <span>&copy; {{ site.year }} ghaith salih &mdash; all rights reserved</span>
    <div class="mini-footer__links">
      <template v-for="link in links" :key="link.label">
        <a v-if="link.href" :href="link.href" target="_blank" rel="noopener">{{ link.label }}</a>
        <RouterLink v-else :to="link.to">{{ link.label }}</RouterLink>
      </template>
    </div>
  </footer>
</template>

<style scoped>
.mini-footer {
  border-top: 1px solid var(--line);
  padding: 36px var(--gutter);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  opacity: 0.55;
}

.mini-footer__links {
  display: flex;
  gap: 22px;
}
</style>

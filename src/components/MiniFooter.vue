<script setup>
import { useSite } from '../composables/useSite'

const { site } = useSite()

defineProps({
  // Left-most link differs per page (journal vs. all courses). Each entry is
  // either { key } for a translated nav label or { label } for a name that
  // comes from the dashboard, such as a social network.
  links: { type: Array, required: true },
})
</script>

<template>
  <footer class="mini-footer mono">
    <span>{{ $t('common.rights', { year: site?.year ?? '', name: site?.name ?? '' }) }}</span>
    <div class="mini-footer__links">
      <template v-for="link in links" :key="link.key ?? link.label">
        <a v-if="link.href" :href="link.href" target="_blank" rel="noopener">
          {{ link.key ? $t(`nav.${link.key}`) : link.label }}
        </a>
        <RouterLink v-else :to="link.to">
          {{ link.key ? $t(`nav.${link.key}`) : link.label }}
        </RouterLink>
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

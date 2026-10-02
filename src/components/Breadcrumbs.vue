<script setup>
defineProps({
  // [{ label, to }] from the home page down. The last one is where the visitor
  // already is, so it is never a link.
  items: { type: Array, required: true },
})
</script>

<template>
  <nav class="crumbs" :aria-label="$t('nav.breadcrumb')">
    <ol class="crumbs__list">
      <li v-for="(item, i) in items" :key="i" class="crumbs__item">
        <RouterLink v-if="i < items.length - 1" :to="item.to" class="crumbs__link">
          {{ item.label }}
        </RouterLink>
        <span v-else class="crumbs__here" aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.crumbs__item {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
}

.crumbs__item + .crumbs__item::before {
  content: '/';
  margin: 0 10px;
  opacity: 0.35;
}

.crumbs__link {
  opacity: 0.55;
  transition: opacity 0.3s ease;
}

.crumbs__link:hover,
.crumbs__link:focus-visible {
  opacity: 1;
}

/* A post title can run long; it is the one crumb allowed to give way. */
.crumbs__here {
  max-width: min(42ch, 100%);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.9;
}
</style>

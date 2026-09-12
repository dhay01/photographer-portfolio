<script setup>
import { useSite } from '../composables/useSite'

const { site } = useSite()

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<template>
  <footer id="contact" class="site-footer">
    <div class="shell">
      <span data-fade class="eyebrow">{{ $t('footer.eyebrow') }}</span>

      <a :href="site ? `mailto:${site.email}` : undefined" data-fade class="footer-cta">
        {{ $t('footer.headline') }}<br />{{ $t('footer.headlineAccent') }}
        <span class="footer-cta__arrow">&#8599;</span>
      </a>

      <div data-fade class="footer-meta">
        <div class="footer-meta__group">
          <div>
            <div class="footer-label">{{ $t('footer.email') }}</div>
            <a :href="site ? `mailto:${site.email}` : undefined" class="footer-value">{{ site?.email }}</a>
          </div>
          <div>
            <div class="footer-label">{{ $t('footer.phone') }}</div>
            <a :href="site ? `tel:${site.phone_href}` : undefined" class="footer-value">{{ site?.phone }}</a>
          </div>
          <div>
            <div class="footer-label">{{ $t('footer.studio') }}</div>
            <span class="footer-value footer-value--static">{{ site?.studio }}</span>
          </div>
        </div>

        <div class="footer-social">
          <a
            v-for="social in site?.socials ?? []"
            :key="social.label"
            :href="social.href"
            target="_blank"
            rel="noopener"
          >
            {{ social.label }}
          </a>
        </div>
      </div>

      <div class="footer-base">
        <span>{{ $t('common.rights', { year: site?.year ?? '', name: site?.name ?? '' }) }}</span>
        <button type="button" class="footer-top" @click="scrollTop">{{ $t('common.backToTop') }}</button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--line);
  padding: clamp(70px, 10vw, 150px) var(--gutter) 40px;
}

.footer-cta {
  display: block;
  margin-top: 26px;
  font-weight: 700;
  font-size: clamp(40px, 9vw, 150px);
  line-height: 0.92;
  letter-spacing: -0.04em;
  text-transform: lowercase;
}

.footer-cta:hover {
  opacity: 0.7;
}

.footer-cta__arrow {
  font-weight: 300;
  font-size: 0.5em;
  vertical-align: middle;
}

.footer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: clamp(48px, 7vw, 90px);
}

.footer-meta__group {
  display: flex;
  gap: clamp(24px, 3vw, 48px);
  flex-wrap: wrap;
}

.footer-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 8px;
}

.footer-value {
  font-size: 15px;
}

.footer-value--static {
  opacity: 0.85;
}

.footer-social {
  display: flex;
  gap: 22px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.footer-social a {
  opacity: 0.7;
}

.footer-social a:hover {
  opacity: 1;
}

.footer-base {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  margin-top: clamp(40px, 6vw, 72px);
  padding-top: 26px;
  border-top: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  opacity: 0.5;
}

.footer-top {
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  padding: 0;
}

.footer-top:hover {
  color: #fff;
}
</style>

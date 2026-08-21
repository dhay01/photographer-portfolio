<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteNav from '../components/SiteNav.vue'
import ImageSlot from '../components/ImageSlot.vue'
import ReserveModal from '../components/ReserveModal.vue'
import { useSiteMotion } from '../composables/useSiteMotion'
import { workshops, formatDates, monthName } from '../data/courses'
import { getCourseDetail, instructor } from '../data/courseDetails'
import { site } from '../data/site'

const root = ref(null)
useSiteMotion(root)

const route = useRoute()
const course = computed(() => workshops.find((w) => w.slug === route.params.slug) ?? workshops[0])
const detail = computed(() => getCourseDetail(course.value))

const shortRange = computed(() => {
  const c = course.value
  const mn = monthName(c.month).slice(0, 3)
  return c.endDay ? `${c.day}–${c.endDay} ${mn} ${c.year}` : `${c.day} ${mn} ${c.year}`
})

const openFaq = ref(null)
const toggleFaq = (i) => (openFaq.value = openFaq.value === i ? null : i)

const enrolled = ref(false)
const reserveOpen = ref(false)
</script>

<template>
  <div ref="root" class="cd">
    <SiteNav />

    <header class="cd__head">
      <RouterLink to="/courses" class="mono cd__back">&larr; All courses</RouterLink>

      <div data-reveal class="mono cd__kicker">
        <span class="cd__mode">{{ course.mode }}</span>
        <span class="cd__dot" />
        <span class="cd__level">{{ course.level }}</span>
      </div>

      <h1 data-reveal class="cd__title">{{ course.title }}</h1>

      <div data-reveal class="cd__facts">
        <div><div class="mono cd__label">Dates</div><div class="cd__value">{{ formatDates(course) }}</div></div>
        <div><div class="mono cd__label">Location</div><div class="cd__value">{{ detail.locationLong }}</div></div>
        <div><div class="mono cd__label">Duration</div><div class="cd__value">{{ detail.duration }}</div></div>
        <div><div class="mono cd__label">Seats</div><div class="cd__value">{{ detail.seatsDetail }}</div></div>
      </div>
    </header>

    <section class="cd__cover-wrap">
      <div data-reveal class="cd__cover">
        <div class="cd__cover-img">
          <ImageSlot :src="detail.cover" :alt="course.title" placeholder="course cover · 21:9" />
        </div>
        <div class="cd__cover-scrim" />
      </div>
    </section>

    <section class="cd__body">
      <div class="cd__grid">
        <div>
          <div data-fade>
            <span class="eyebrow">Overview</span>
            <p class="cd__overview">{{ detail.overview }}</p>
          </div>

          <div data-fade class="cd__block">
            <span class="eyebrow">What you&rsquo;ll learn</span>
            <div class="outcomes">
              <div v-for="(o, i) in detail.outcomes" :key="o" class="outcome">
                <span class="mono outcome__n">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="outcome__text">{{ o }}</span>
              </div>
            </div>
          </div>

          <div v-if="detail.syllabus.length" data-fade class="cd__block">
            <span class="eyebrow">Syllabus</span>
            <div class="syllabus">
              <div v-for="day in detail.syllabus" :key="day.day" class="syllabus__day">
                <div class="syllabus__head">
                  <span class="mono syllabus__n">{{ day.day }}</span>
                  <span class="syllabus__title">{{ day.title }}</span>
                </div>
                <div class="syllabus__slots">
                  <div v-for="slot in day.slots" :key="slot.time" class="syllabus__slot">
                    <span class="mono syllabus__time">{{ slot.time }}</span>
                    <span class="syllabus__what">{{ slot.what }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div data-fade class="cd__block cd__two-col">
            <div>
              <span class="eyebrow">Included</span>
              <ul class="ticks">
                <li v-for="item in detail.included" :key="item">
                  <span class="ticks__mark">&#10003;</span>{{ item }}
                </li>
              </ul>
            </div>
            <div>
              <span class="eyebrow">Prerequisites</span>
              <ul class="ticks ticks--dash">
                <li v-for="item in detail.prerequisites" :key="item">
                  <span class="ticks__mark">&mdash;</span>{{ item }}
                </li>
              </ul>
            </div>
          </div>

          <div data-fade class="instructor">
            <div class="instructor__photo">
              <ImageSlot :src="instructor.photo" :alt="instructor.name" placeholder="instructor" />
            </div>
            <div>
              <div class="mono instructor__label">Your instructor</div>
              <div class="instructor__name">{{ instructor.name }}</div>
              <p class="instructor__bio">{{ instructor.bio }}</p>
            </div>
          </div>

          <div data-fade class="cd__block">
            <span class="eyebrow">FAQ</span>
            <div class="faqs">
              <div v-for="(faq, i) in detail.faqs" :key="faq.q" class="faq">
                <button class="faq__q" :aria-expanded="openFaq === i" @click="toggleFaq(i)">
                  {{ faq.q }}
                  <span class="faq__icon" :class="{ 'faq__icon--on': openFaq === i }">+</span>
                </button>
                <div class="faq__a" :class="{ 'faq__a--open': openFaq === i }">
                  <p>{{ faq.a }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STICKY ENROLL -->
        <aside data-fade class="enroll">
          <div class="enroll__price">
            <span class="enroll__amount">{{ course.price }}</span>
            <span class="mono enroll__per">per seat</span>
          </div>

          <div class="enroll__meta">
            <div><span>Dates</span><span>{{ shortRange }}</span></div>
            <div><span>Location</span><span>{{ course.loc }}</span></div>
            <div><span>Seats left</span><span class="enroll__seats">{{ detail.seatsShort }}</span></div>
          </div>

          <button
            v-if="!enrolled"
            class="btn btn--solid enroll__submit"
            @click="reserveOpen = true"
          >
            Reserve a seat
          </button>

          <div v-else class="enroll__done">
            <div class="enroll__check">&#10003;</div>
            <div class="enroll__done-title">Seat reserved</div>
            <p class="enroll__done-copy">Check your inbox for confirmation and an invoice.</p>
          </div>

          <p class="mono enroll__fineprint">
            No payment now &mdash; we&rsquo;ll email your invoice.
          </p>
        </aside>
      </div>
    </section>

    <footer class="cd__footer mono">
      <span>&copy; {{ site.year }} ghaith salih &mdash; all rights reserved</span>
      <div class="cd__footer-links">
        <RouterLink to="/courses">All courses</RouterLink>
        <RouterLink to="/#contact">Contact</RouterLink>
        <RouterLink to="/">Home &rarr;</RouterLink>
      </div>
    </footer>

    <ReserveModal
      v-if="reserveOpen"
      :course="course"
      @close="reserveOpen = false"
      @reserved="enrolled = true"
    />
  </div>
</template>

<style scoped>
.cd {
  position: relative;
  min-height: 100vh;
}

.cd :deep(.site-nav) {
  position: sticky;
  top: 0;
  padding-block: 22px;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.9), rgba(11, 12, 14, 0));
}

/* ---------- header ---------- */

.cd__head {
  padding: clamp(16px, 2vw, 28px) var(--gutter) clamp(30px, 4vw, 52px);
}

.cd__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.6;
}

.cd__kicker {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 26px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.cd__mode {
  color: var(--accent);
}

.cd__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.cd__level {
  opacity: 0.7;
}

.cd__title {
  margin-top: 16px;
  font-weight: 600;
  font-size: clamp(38px, 6vw, 92px);
  line-height: 0.94;
  letter-spacing: -0.035em;
  max-width: 14ch;
}

.cd__facts {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(20px, 3vw, 44px);
  margin-top: 26px;
}

.cd__label {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.45;
  margin-bottom: 6px;
}

.cd__value {
  font-size: 15px;
}

/* ---------- cover ---------- */

.cd__cover-wrap {
  padding: 0 var(--gutter) clamp(30px, 4vw, 50px);
}

.cd__cover {
  position: relative;
  aspect-ratio: 21 / 9;
  border-radius: 10px;
  overflow: hidden;
}

.cd__cover-img {
  position: absolute;
  inset: 0;
  animation: gs-kb-soft 11s ease-in-out infinite alternate;
}

@keyframes gs-kb-soft {
  0% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1.1);
  }
}

.cd__cover-scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.15), rgba(11, 12, 14, 0.35));
}

/* ---------- body ---------- */

.cd__body {
  padding: clamp(30px, 4vw, 54px) var(--gutter) clamp(60px, 8vw, 110px);
}

.cd__grid {
  max-width: var(--maxw);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 360px);
  gap: clamp(36px, 5vw, 80px);
  align-items: start;
}

@media (max-width: 900px) {
  .cd__grid {
    grid-template-columns: 1fr;
  }
}

.cd__overview {
  margin-top: 18px;
  font-size: clamp(17px, 1.6vw, 21px);
  line-height: 1.65;
  font-weight: 300;
  opacity: 0.85;
  text-wrap: pretty;
}

.cd__block {
  margin-top: clamp(40px, 5vw, 64px);
}

.cd__two-col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(24px, 3vw, 40px);
}

@media (max-width: 620px) {
  .cd__two-col {
    grid-template-columns: 1fr;
  }
}

/* ---------- outcomes ---------- */

.outcomes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 28px;
  margin-top: 20px;
}

@media (max-width: 620px) {
  .outcomes {
    grid-template-columns: 1fr;
  }
}

.outcome {
  display: flex;
  gap: 12px;
}

.outcome__n {
  color: var(--accent);
}

.outcome__text {
  font-size: 15px;
  line-height: 1.5;
  opacity: 0.85;
}

/* ---------- syllabus ---------- */

.syllabus {
  margin-top: 22px;
  border-top: 1px solid var(--line);
}

.syllabus__day {
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
}

.syllabus__day:last-child {
  border-bottom: none;
}

.syllabus__head {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.syllabus__n {
  font-size: 12px;
  color: var(--accent);
}

.syllabus__title {
  font-size: clamp(18px, 1.8vw, 24px);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.syllabus__slots {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.syllabus__slot {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
}

.syllabus__time {
  font-size: 12px;
  opacity: 0.5;
}

.syllabus__what {
  font-size: 14.5px;
  opacity: 0.85;
}

/* ---------- lists ---------- */

.ticks {
  list-style: none;
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.ticks li {
  display: flex;
  gap: 10px;
  font-size: 14.5px;
  line-height: 1.5;
  opacity: 0.85;
}

.ticks__mark {
  color: var(--accent);
}

.ticks--dash .ticks__mark {
  color: inherit;
  opacity: 0.4;
}

/* ---------- instructor ---------- */

.instructor {
  margin-top: clamp(44px, 5vw, 70px);
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 24px;
  align-items: center;
  border-top: 1px solid var(--line);
  padding-top: clamp(32px, 4vw, 48px);
}

.instructor__photo {
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
}

.instructor__label {
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.5;
}

.instructor__name {
  font-size: 20px;
  font-weight: 500;
  margin-top: 6px;
}

.instructor__bio {
  margin-top: 10px;
  font-size: 14.5px;
  line-height: 1.6;
  font-weight: 300;
  opacity: 0.72;
  text-wrap: pretty;
}

/* ---------- faq ---------- */

.faqs {
  margin-top: 20px;
  border-top: 1px solid var(--line);
}

.faq {
  border-bottom: 1px solid var(--line);
}

.faq__q {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 20px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-family: var(--font-sans);
  font-size: clamp(16px, 1.5vw, 19px);
  font-weight: 400;
}

.faq__icon {
  color: var(--accent);
  font-size: 22px;
  transition: transform 0.3s ease;
}

.faq__icon--on {
  transform: rotate(45deg);
}

.faq__a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s ease;
}

.faq__a--open {
  grid-template-rows: 1fr;
}

.faq__a > p {
  overflow: hidden;
  font-size: 15px;
  line-height: 1.65;
  font-weight: 300;
  opacity: 0.72;
  max-width: 64ch;
  text-wrap: pretty;
}

.faq__a--open > p {
  padding-bottom: 20px;
}

/* ---------- enroll ---------- */

.enroll {
  position: sticky;
  top: 90px;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: clamp(22px, 2.2vw, 30px);
  background: rgba(20, 21, 24, 0.5);
}

.enroll__price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.enroll__amount {
  font-size: clamp(30px, 3.4vw, 44px);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.enroll__per {
  font-size: 11px;
  opacity: 0.5;
}

.enroll__meta {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.enroll__meta > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13.5px;
}

.enroll__meta > div > span:first-child {
  opacity: 0.55;
}

.enroll__seats {
  color: var(--accent);
}

.enroll__submit {
  width: 100%;
  margin-top: 22px;
  padding: 15px;
  justify-content: center;
}

.enroll__done {
  text-align: center;
  padding: 8px 0;
}

.enroll__check {
  width: 56px;
  height: 56px;
  margin: 6px auto 0;
  border-radius: 50%;
  border: 1px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 24px;
}

.enroll__done-title {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 500;
}

.enroll__done-copy {
  margin-top: 8px;
  font-size: 13.5px;
  line-height: 1.55;
  font-weight: 300;
  opacity: 0.7;
  text-wrap: pretty;
}

.enroll__fineprint {
  margin-top: 14px;
  font-size: 10px;
  letter-spacing: 0.04em;
  opacity: 0.4;
  text-align: center;
  text-wrap: pretty;
}

/* ---------- footer ---------- */

.cd__footer {
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

.cd__footer-links {
  display: flex;
  gap: 22px;
}
</style>

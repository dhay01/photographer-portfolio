import { photos } from './photos'

/**
 * Long-form content per workshop. Only the flagship course is fully written in
 * the design; the rest fall back to `defaultDetail`, which reuses the schedule
 * data so every slug still renders a complete page.
 */
const details = {
  'language-of-light': {
    cover: photos.stars,
    duration: '2 days · 14 hrs',
    seatsDetail: '8 left of 10',
    seatsShort: '8 of 10',
    locationLong: 'Studio, Baghdad',
    overview:
      'Two days on the one thing that separates a snapshot from a photograph: light. We work entirely with continuous and window light in the studio — shaping it, reading it, and learning to wait for it. You’ll leave able to look at any room and know exactly where to stand.',
    outcomes: [
      'Reading direction, quality and colour of light',
      'Shaping window light with flags and scrims',
      'Metering for mood, not just exposure',
      'Building a frame around a single light source',
      'Directing a subject without over-directing',
      'A calm, repeatable edit that protects the light',
    ],
    syllabus: [
      {
        day: 'Day 01',
        title: 'Seeing light',
        slots: [
          { time: '09:00', what: 'Intro · the vocabulary of light' },
          { time: '11:00', what: 'Window-light shaping demo' },
          { time: '14:00', what: 'Hands-on: one light, one subject' },
          { time: '16:30', what: 'Group review & feedback' },
        ],
      },
      {
        day: 'Day 02',
        title: 'Shaping & finishing',
        slots: [
          { time: '09:00', what: 'Metering for mood workshop' },
          { time: '11:30', what: 'Personal shoot · your concept' },
          { time: '14:30', what: 'Editing the light in post' },
          { time: '16:30', what: 'Final critique · certificates' },
        ],
      },
    ],
    included: [
      'Studio time & all lighting gear',
      'A professional model for both days',
      'Lunch & coffee',
      'Edited selects from your shoot',
      'Certificate of completion',
    ],
    prerequisites: [
      'Your own camera with manual mode',
      'One fast prime lens (35 / 50 / 85)',
      'A laptop with your editing software',
      'Comfort with basic exposure',
    ],
    faqs: [
      {
        q: 'Do I need my own gear?',
        a: 'Yes — bring a camera with manual mode and one fast prime. All studio lighting, modifiers and the model are provided.',
      },
      {
        q: 'Is it beginner friendly?',
        a: 'It’s pitched at intermediate level — you should be comfortable with exposure and manual mode. Total beginners are better served by the weekend workshops first.',
      },
      {
        q: 'What’s the refund policy?',
        a: 'Full refund up to 14 days before. Within 14 days, your seat can be transferred to a future workshop or to another person.',
      },
    ],
  },
}

const defaultDetail = (workshop) => ({
  cover: photos.ranges,
  duration: workshop.endDay ? `${workshop.endDay - workshop.day + 1} days` : '1 day',
  seatsDetail: workshop.seats,
  seatsShort: workshop.seatsShort,
  locationLong: workshop.loc,
  overview:
    'A small-group session built around one idea, taught the way I actually work — time in the field, honest critique, and an edit you can repeat on your own afterwards.',
  outcomes: [
    'Reading a scene before you raise the camera',
    'Composition that survives a crop',
    'Exposure decisions made for mood',
    'A repeatable, restrained edit',
  ],
  syllabus: [],
  included: ['Small-group tuition', 'Group critique session', 'Certificate of completion'],
  prerequisites: ['Your own camera with manual mode', 'Comfort with basic exposure'],
  faqs: [
    {
      q: 'What’s the refund policy?',
      a: 'Full refund up to 14 days before. Within 14 days, your seat can be transferred to a future workshop or to another person.',
    },
  ],
})

export const instructor = {
  name: 'Ghaith Salih',
  photo: photos.portraitStudy,
  bio: '12+ years behind the lens, 7 years teaching. I keep groups small so everyone leaves with work they’re proud of — and the eye to keep making it.',
}

export const getCourseDetail = (workshop) =>
  workshop ? (details[workshop.slug] ?? defaultDetail(workshop)) : null

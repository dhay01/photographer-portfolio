import { photos } from './photos'

/**
 * Canonical schedule. `month` is 0-indexed to match Date, matching the
 * prototype's calendar maths.
 */
export const workshops = [
  {
    slug: 'language-of-light',
    year: 2026,
    month: 2,
    day: 14,
    endDay: 15,
    title: 'The Language of Light',
    mode: '2-day studio intensive',
    loc: 'Baghdad',
    level: 'Intermediate',
    price: '$480',
    seats: '8 seats left',
    seatsShort: '8 left',
  },
  {
    slug: 'architecture-interiors',
    year: 2026,
    month: 2,
    day: 28,
    title: 'Architecture & Interiors',
    mode: '1-day city walk',
    loc: 'Samarra',
    level: 'Intermediate',
    price: '$150',
    seats: '14 seats left',
    seatsShort: '14 left',
  },
  {
    slug: 'astro-night-panorama',
    year: 2026,
    month: 3,
    day: 5,
    endDay: 6,
    title: 'Astro & Night Panorama',
    mode: 'Weekend field workshop',
    loc: 'Halgurd',
    level: 'All levels',
    price: '$360',
    seats: '10 seats left',
    seatsShort: '10 left',
  },
  {
    slug: 'portraits-natural-light',
    year: 2026,
    month: 4,
    day: 9,
    endDay: 10,
    title: 'Portraits in Natural Light',
    mode: 'Weekend workshop',
    loc: 'Erbil',
    level: 'Beginner',
    price: '$320',
    seats: '12 seats left',
    seatsShort: '12 left',
  },
  {
    slug: 'gigapixel-stitching',
    year: 2026,
    month: 5,
    day: 20,
    title: 'Gigapixel & Stitching',
    mode: 'Live online masterclass',
    loc: 'Online',
    level: 'Advanced',
    price: '$180',
    seats: '40 seats left',
    seatsShort: '40 left',
  },
  {
    slug: 'annual-training-camp',
    year: 2026,
    month: 7,
    day: 1,
    endDay: 30,
    title: 'The Annual Training Camp',
    mode: '1-month intensive program',
    loc: 'Baghdad',
    level: 'All levels',
    price: '$1,400',
    seats: '15 seats left',
    seatsShort: '15 left',
  },
]

/** The three-row teaser on the homepage. */
export const courses = [
  {
    slug: 'annual-training-camp',
    title: 'The Annual Training Camp',
    format: '1-month intensive program',
    where: 'Baghdad · Aug 2026',
    status: 'Limited seats',
    price: '$480',
  },
  {
    slug: 'portraits-natural-light',
    title: 'On-Ground Field Workshop',
    format: 'Weekend in the field',
    where: 'Iraq · 2026',
    status: '12 seats left',
    price: '$320',
  },
  {
    slug: 'gigapixel-stitching',
    title: 'Online Masterclass',
    format: 'Self-paced, worldwide',
    where: 'Online · Ongoing',
    status: 'Open',
    price: '$180',
  },
]

export const pastWorkshops = [
  { id: 'past-1', date: 'Feb 2025', loc: 'Zagros', title: 'Winter Light Expedition', attendees: '14 photographers', src: photos.ranges },
  { id: 'past-2', date: 'Sep 2024', loc: 'Halgurd', title: 'Night Sky Bootcamp', attendees: '10 photographers', src: photos.stars },
  { id: 'past-3', date: 'Aug 2024', loc: 'Baghdad', title: 'The First Annual Camp', attendees: '15 photographers', src: photos.valley },
  { id: 'past-4', date: 'Apr 2024', loc: 'Baghdad', title: 'Studio Portrait Lab', attendees: '12 photographers', src: photos.portraitStudy },
  { id: 'past-5', date: 'Mar 2024', loc: 'Samarra', title: 'Old City Architecture Walk', attendees: '16 photographers', src: photos.arch },
  { id: 'past-6', date: 'Nov 2023', loc: 'Baghdad', title: 'Sony × APU Video Workshop', attendees: '40 photographers', src: photos.assignment },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const monthName = (m) => MONTHS[m]

export const formatDates = (w) => {
  if (!w) return ''
  const mn = monthName(w.month)
  if (w.endDay) return `${w.day}–${w.endDay} ${mn} ${w.year}`
  return `${w.day} ${mn} ${w.year}`
}

export const shortDate = (w) =>
  `${String(w.day).padStart(2, '0')} ${monthName(w.month).slice(0, 3)}`

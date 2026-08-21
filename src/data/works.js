import { photos } from './photos'

export const workCategories = [
  'All',
  'Landscape',
  'Panorama',
  'Gigapixel',
  'Portrait',
  'Commercial',
  'Architecture',
]

export const works = [
  { slug: 'w1', cat: 'Landscape', title: 'Misty Ranges', loc: 'Zagros, Iraq', gear: 'Sigma 14mm f/1.8', ratio: '16/10', src: photos.ranges, zoom: false },
  { slug: 'w2', cat: 'Panorama', title: 'A Thousand Stars', loc: 'Halgurd, Iraq', gear: 'Sigma 14mm f/1.8', ratio: '4/5', src: photos.stars, zoom: true },
  { slug: 'w3', cat: 'Panorama', title: 'The White Valley', loc: 'Sakran, Iraq', gear: 'Sigma 14mm f/1.8', ratio: '1/1', src: photos.valley, zoom: true },
  { slug: 'w4', cat: 'Commercial', title: 'On Assignment', loc: 'Kurdistan', gear: 'Sigma 70-200mm f/2.8', ratio: '3/2', src: photos.assignment, zoom: false },
  { slug: 'w5', cat: 'Architecture', title: 'Muqarnas', loc: 'Kadhimiya', gear: 'Sigma 14mm f/1.8', ratio: '3/2', src: photos.muqarnas, zoom: true },
  { slug: 'w6', cat: 'Portrait', title: 'Study in Grey', loc: 'Studio, Baghdad', gear: 'Sigma 105mm Macro', ratio: '1/1', src: photos.portraitStudy, zoom: false },
  { slug: 'w7', cat: 'Portrait', title: 'Devotion', loc: 'Karbala', gear: 'Sigma 105mm Macro', ratio: '3/2', src: photos.devotion, zoom: false },
  { slug: 'w8', cat: 'Architecture', title: 'Through the Arch', loc: 'Samarra', gear: 'Sigma 14mm f/1.8', ratio: '2/3', src: photos.arch, zoom: true },
  { slug: 'w9', cat: 'Portrait', title: 'The Herder', loc: 'Al-Jazira', gear: 'Sigma 70-200mm f/2.8', ratio: '3/2', src: photos.herder, zoom: false },
  { slug: 'w10', cat: 'Landscape', title: 'Dunes at Dusk', loc: 'Western Desert', gear: 'Sigma 70-200mm f/2.8', ratio: '4/5', src: '', zoom: false },
  { slug: 'w11', cat: 'Gigapixel', title: 'City Panorama', loc: 'Baghdad', gear: 'Sigma 105mm Macro', ratio: '21/9', src: '', zoom: true },
  { slug: 'w12', cat: 'Commercial', title: 'Product Study', loc: 'Studio', gear: 'Sigma 105mm Macro', ratio: '1/1', src: '', zoom: false },
  { slug: 'w13', cat: 'Landscape', title: 'River Bend', loc: 'Tigris', gear: 'Sigma 14mm f/1.8', ratio: '3/2', src: '', zoom: false },
  { slug: 'w14', cat: 'Architecture', title: 'Spiral Minaret', loc: 'Samarra', gear: 'Sigma 70-200mm f/2.8', ratio: '2/3', src: '', zoom: false },
  { slug: 'w15', cat: 'Gigapixel', title: 'Mountain Stitch', loc: 'Zagros', gear: 'Sigma 14mm f/1.8', ratio: '21/9', src: '', zoom: true },
  { slug: 'w16', cat: 'Portrait', title: 'Elder', loc: 'Baghdad', gear: 'Sigma 105mm Macro', ratio: '4/5', src: '', zoom: false },
  { slug: 'w17', cat: 'Commercial', title: 'Editorial Set', loc: 'Studio', gear: 'Sigma 70-200mm f/2.8', ratio: '3/2', src: '', zoom: false },
  { slug: 'w18', cat: 'Panorama', title: 'Coastline', loc: 'Basra', gear: 'Sigma 14mm f/1.8', ratio: '21/9', src: '', zoom: true },
]

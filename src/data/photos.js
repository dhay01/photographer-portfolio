/**
 * Single source of truth for the uploaded photography. Filenames come straight
 * from the design bundle's uploads/ folder; keys are the readable handles the
 * pages use so a swap only has to happen here.
 */
const upload = (file) => `/uploads/${encodeURIComponent(file)}`

export const photos = {
  ranges: upload('589903741_18554882992055421_5603779562178377351_n.jpg'),
  stars: upload('608189925_18557068639055421_3317370782112853283_n.jpg'),
  valley: upload('images.jpeg'),
  assignment: upload('images (1).jpeg'),
  muqarnas: upload('images (2).jpeg'),
  portraitStudy: upload('images (3).jpeg'),
  devotion: upload('651054829_18577811026055421_4883273883445382392_n.jpg'),
  arch: upload('651508649_18577811014055421_4024825212185473190_n.jpg'),
  herder: upload('Screenshot 2026-08-02 at 11.07.18 AM.png'),
  frameA: upload('Screenshot 2026-07-24 at 4.09.26 PM.png'),
  frameB: upload('Screenshot 2026-07-24 at 4.22.16 PM.png'),
  textureA: upload('8420b80f332b4448f6fe0880018ce2a1.webp'),
  textureB: upload('dc845662fa38f0aaf1a6293c9053a935.webp'),
}

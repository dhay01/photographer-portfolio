/**
 * Plans the mosaic grid in style.css: rows of one wide cell and two squares, the
 * wide cell swapping ends from row to row, so shapes mix whatever the photographs
 * are and every row ends flush. A portrait is kept out of a wide cell when the
 * other end of its row can take it. Leftovers close the grid flush too: a last
 * row of four squares, a pair of wide cells, or a lone frame across the page.
 *
 * Returns the items in their original order as { item, size }, size being
 * 'square', 'wide' (beside two squares), 'pair' (two wide cells sharing a row)
 * or 'full'.
 */
export function mosaic(items, ratioOf = () => 1.5) {
  if (items.length === 1) return [{ item: items[0], size: 'full' }]

  const cells = []
  let start = 0
  let triples = 0

  while (start < items.length) {
    const rest = items.length - start
    const count = rest === 4 || rest === 2 ? rest : 3
    const row = items.slice(start, start + count)

    if (count === 3) {
      let wide = triples % 2 === 0 ? 0 : 2
      const other = 2 - wide
      if (ratioOf(row[wide]) < 1 && ratioOf(row[other]) >= 1) wide = other
      row.forEach((item, i) => cells.push({ item, size: i === wide ? 'wide' : 'square' }))
      triples += 1
    } else {
      const size = count === 2 ? 'pair' : 'square'
      row.forEach((item) => cells.push({ item, size }))
    }

    start += count
  }

  return cells
}

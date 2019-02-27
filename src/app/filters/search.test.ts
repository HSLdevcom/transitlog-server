import { search } from './search'

describe('Search', () => {
  let items: any[] = []

  beforeEach(() => {
    items = [
      { type: 'item', id: '1' },
      { type: 'item', id: '2' },
      { type: 'item', id: '3' },
      { type: 'object', id: '4' },
    ]
  })

  const itemToSearchTerms = (item) => [item.type, item.id]

  it('matches search terms to objects', () => {
    const filtered = search(items, 'item', itemToSearchTerms)
    expect(filtered).toHaveLength(3)
    expect(filtered.map((i) => i.type)).toContain('item')
    expect(filtered.map((i) => i.type)).not.toContain('object')
  })

  it('gives a score based on how well the search term matched the item', () => {
    const filtered = search(items, 'item 2', itemToSearchTerms)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].type).toEqual('item')
    expect(filtered[0].id).toEqual('2')
    expect(filtered[0]._matchScore).toBeGreaterThanOrEqual(99)
    expect(filtered.map((i) => i.type)).not.toContain('object')
  })
})

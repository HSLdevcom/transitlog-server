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

  it('matches search terms to objects', () => {
    const filtered = search(items, 'item', ['type', 'id'])
    expect(filtered).toHaveLength(3)
    expect(filtered.map((i) => i.type)).toContain('item')
    expect(filtered.map((i) => i.type)).not.toContain('object')
  })
})

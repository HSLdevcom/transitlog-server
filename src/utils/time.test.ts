import { getDepartureTime } from './time'

describe('getDepartureTime', () => {
  const departure = {
    hours: 8,
    minutes: 15,
    is_next_day: false,
  }

  it('includes departure seconds', () => {
    expect(getDepartureTime({ ...departure, seconds: 27 })).toBe('08:15:27')
  })

  it('defaults null departure seconds to zero', () => {
    expect(getDepartureTime({ ...departure, seconds: null })).toBe('08:15:00')
  })

  it('includes arrival seconds', () => {
    expect(
      getDepartureTime(
        {
          ...departure,
          arrival_hours: 9,
          arrival_minutes: 0,
        },
        true
      )
    ).toBe('09:00:00')
  })

  it('defaults arrival seconds to zero', () => {
    expect(
      getDepartureTime(
        {
          ...departure,
          arrival_hours: 9,
          arrival_minutes: 0,
        },
        true
      )
    ).toBe('09:00:00')
  })
})

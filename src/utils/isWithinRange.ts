export function intval(val: string | number = 0) {
  return !val ? 0 : typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) : val
}

export function isBefore(value, otherValue) {
  const checkVal = intval(value)
  const otherVal = intval(otherValue)
  return checkVal <= otherVal
}

export function isAfter(value, otherValue) {
  const checkVal = intval(value)
  const otherVal = intval(otherValue)
  return checkVal >= otherVal
}

export function isWithinRange(
  value: string | number,
  rangeStart: string | number,
  rangeEnd: string | number
) {
  return isAfter(value, rangeStart) && isBefore(value, rangeEnd)
}

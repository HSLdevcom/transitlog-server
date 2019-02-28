export const getDirection = (value: string | number | false | undefined | null) => {
  if (!value) {
    return null
  }

  const intval = typeof value !== 'number' ? parseInt(value, 10) : value
  return isNaN(intval) ? null : intval > 2 ? null : intval
}

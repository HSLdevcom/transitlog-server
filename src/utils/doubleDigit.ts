export const doubleDigit = (val = 0, padEnd = false) => {
  const padded = !padEnd ? '0' + val : val + '0'
  return !padEnd ? padded.slice(-2) : padded.slice(0, 2)
}

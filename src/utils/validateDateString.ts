// Validates that the input string is a valid date formatted as "YYYY-MM-DD"
// Returns the string if valid, null otherwise.
export function validateDateString(dateString: unknown = ''): string | null {
  if (typeof dateString !== 'string') {
    return null
  }

  // First check for the pattern
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null
  }

  // Parse the date parts to integers
  const parts = dateString.split('-')
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)

  // Check the ranges of month and year
  if (year < 1000 || year > 3000 || month === 0 || month > 12) {
    return null
  }

  const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  // Adjust for leap years
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1] ? dateString : null
}

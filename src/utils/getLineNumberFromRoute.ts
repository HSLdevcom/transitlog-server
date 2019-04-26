export const getLineNumberFromRoute = (lineId: string) => {
  const lineStr = lineId + ''
  // Special case for train lines, they should only show a letter.
  if (/^300[12]/.test(lineStr)) {
    return lineStr.replace(/\d+/, '')
  }

  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  return lineStr.substring(1).replace(/^0+/, '')
}

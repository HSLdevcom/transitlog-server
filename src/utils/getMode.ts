export function getMode(code) {
  if (!code) {
    return ''
  }

  switch (code) {
    case '02':
      return 'TRAM'
    case '06':
      return 'SUBWAY'
    case '07':
      return 'FERRY'
    case '08':
      return 'U'
    case '12':
      return 'RAIL'
    case '13':
      return 'RAIL'
    default:
      return 'BUS'
  }
}

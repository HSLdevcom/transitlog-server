export function getMode(code) {
  switch (code) {
    case '02':
      return 'TRAM'
    case '06':
      return 'SUBWAY'
    case '07':
      return 'FERRY'
    case '12':
      return 'RAIL'
    case '13':
      return 'RAIL'
    default:
      return 'BUS'
  }
}

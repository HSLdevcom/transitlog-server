export function getModeFromRoute(routeId: string) {
  const lineType = routeId.substring(0, 4)
  const lineTypeInt = parseInt(lineType, 10)

  if (lineTypeInt >= 1001 && lineTypeInt <= 1010) {
    return 'TRAM'
  }

  if (/^300[12]/.test(lineType)) {
    return 'RAIL'
  }

  if (lineType.substr(1) === '560' || lineType.substr(1) === '550') {
    return 'TRUNK'
  }

  return 'BUS'
}

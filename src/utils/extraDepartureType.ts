// The extra departure data from JORE may be a bit weird at times,
// so we need to force all unknown values to N. Valid values are
// L, V, LV and N.
export const extraDepartureType = (extraDeparture: string) => {
  if (extraDeparture && ['L', 'V', 'LV', 'N'].includes(extraDeparture)) {
    return extraDeparture
  }

  return 'N'
}

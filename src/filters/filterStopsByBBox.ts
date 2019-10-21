import BoundingBox from 'boundingbox'
import { BBox } from '../types/BBox'
import { Stop } from '../types/generated/schema-types'

export function filterStopsByBBox(stops: Array<Stop | Stop>, bbox: BBox) {
  const bounds = new BoundingBox({
    minlat: bbox.minLat,
    minlon: bbox.minLng,
    maxlat: bbox.maxLat,
    maxlon: bbox.maxLng,
  })

  return stops.filter((stop) => {
    const stopPoint = new BoundingBox({ lat: stop.lat, lng: stop.lng })
    return stopPoint.within(bounds)
  })
}

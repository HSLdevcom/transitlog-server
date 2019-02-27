import BoundingBox from 'boundingbox'
import { BBox } from '../../types/BBox'
import { Stop as JoreStop } from '../../types/generated/jore-types'

export function filterStopsByBBox(stops: JoreStop[], bbox: BBox) {
  const bounds = new BoundingBox({
    minlat: bbox.minLat,
    minlon: bbox.minLng,
    maxlat: bbox.maxLat,
    maxlon: bbox.maxLng,
  })

  return stops.filter((stop) => {
    const stopPoint = new BoundingBox({ lat: stop.lat, lon: stop.lon })
    return stopPoint.within(bounds)
  })
}

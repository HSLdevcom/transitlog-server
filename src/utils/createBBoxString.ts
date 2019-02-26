import { BBox } from '../types/BBox'
import { StringOrNull } from '../types/NullOr'

export function createBBoxString(bbox: BBox | null): StringOrNull {
  if (!bbox) {
    return null
  }
  const { minLng, maxLat, maxLng, minLat } = bbox
  return `${minLng},${maxLat},${maxLng},${minLat}`
}

import { BBox } from '../types/BBox'

// Round down to two decimals
export function floor(number) {
  return Math.floor(number * 10) / 10
}

// Round up to two decimals
export function ceil(number) {
  return Math.ceil(number * 10) / 10
}

// Round to two decimals
export function round(number) {
  return Math.round(number * 10) / 10
}

export function getRoundedBbox(bbox: BBox) {
  if (!bbox) {
    return null
  }

  return {
    minLng: floor(bbox.minLng),
    maxLng: ceil(bbox.maxLng),
    maxLat: ceil(bbox.maxLat),
    minLat: floor(bbox.minLat),
  }
}

// Simplified contiguous-US outline drawn in the same equirectangular projection
// used by PatternLocationMap: lon [-125, -67] → x [40, 920], lat [25, 50] → y [560, 60].
// Stylized — borders are intentionally chunky for the editorial map aesthetic.

// Coordinates were sampled along the US coastline and northern border at roughly
// 1° resolution, then projected with the same formula PatternLocationMap.ts uses.
// This avoids any runtime dependency on a topojson parser.

const coords: [number, number][] = [
  // Pacific coast — Washington → California
  [49.0, -123.0],
  [48.3, -124.7],
  [47.5, -124.5],
  [46.3, -124.0],
  [45.5, -124.0],
  [44.5, -124.1],
  [43.5, -124.3],
  [42.5, -124.4],
  [41.5, -124.0],
  [40.0, -124.2],
  [38.5, -123.0],
  [37.5, -122.5],
  [36.5, -121.9],
  [35.5, -121.0],
  [34.5, -120.5],
  [33.5, -118.5],
  [32.7, -117.2],
  // Mexico border — east across to Gulf
  [32.5, -115.0],
  [31.5, -113.0],
  [31.3, -111.0],
  [31.3, -108.2],
  [31.8, -106.5],
  [29.8, -104.5],
  [29.5, -102.5],
  [27.5, -99.5],
  [26.0, -97.5],
  // Gulf Coast — Texas → Florida → Atlantic
  [27.8, -97.1],
  [29.7, -94.0],
  [29.2, -91.0],
  [29.5, -89.5],
  [30.3, -87.5],
  [29.5, -85.5],
  [28.0, -82.8],
  [25.2, -81.0],
  [25.8, -80.1],
  [27.5, -80.2],
  [29.5, -81.0],
  [31.0, -81.4],
  [32.5, -80.5],
  [33.5, -79.0],
  [34.5, -77.0],
  [36.0, -75.8],
  [37.0, -75.5],
  [38.5, -75.0],
  [39.5, -74.4],
  [40.5, -74.0],
  [41.0, -71.8],
  [41.5, -70.5],
  [42.5, -70.5],
  [43.5, -70.4],
  [44.5, -68.5],
  [45.0, -67.0],
  // Canadian border — east → west
  [45.3, -69.0],
  [45.0, -71.0],
  [45.0, -74.0],
  [44.5, -76.5],
  [43.5, -79.5],
  [42.5, -83.0],
  [45.5, -83.5],
  [46.5, -84.5],
  [46.8, -87.0],
  [47.5, -89.0],
  [48.0, -91.5],
  [48.7, -93.5],
  [49.0, -95.2],
  [49.0, -103.0],
  [49.0, -110.0],
  [49.0, -116.0],
  [49.0, -121.0],
  [49.0, -123.0],
]

const project = (lat: number, lon: number) => {
  const minLon = -125
  const maxLon = -67
  const minLat = 25
  const maxLat = 50
  const x = ((lon - minLon) / (maxLon - minLon)) * (920 - 40) + 40
  const y = ((maxLat - lat) / (maxLat - minLat)) * (560 - 60) + 60
  return { x: x.toFixed(1), y: y.toFixed(1) }
}

let path = ''
coords.forEach((c, i) => {
  const { x, y } = project(c[0], c[1])
  path += (i === 0 ? 'M' : 'L') + x + ' ' + y + ' '
})
path += 'Z'

export const US_OUTLINE_PATH = path

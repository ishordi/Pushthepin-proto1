/* The H-West cluster — Bandra West, the only cluster in v1. */

export const H_WEST_CLUSTER = {
  id: 'h-west',
  name: 'H-West, Bandra West',
  center: { lat: 19.0596, lng: 72.8295 },
  /* Loose bounding box covering the ward */
  bounds: {
    north: 19.075,
    south: 19.040,
    east: 72.845,
    west: 72.815,
  },
  defaultZoom: 15,
} as const;

export function isInCluster(lat: number, lng: number): boolean {
  const { north, south, east, west } = H_WEST_CLUSTER.bounds;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}

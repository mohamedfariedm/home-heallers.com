import type { GeoPoint } from '@/types/geo-regions';

export const REQUIRED_POINTS = 4;
export const MIN_AREA_M2 = 2500;

export type GeoShapeError =
  | 'count'
  | 'distinct'
  | 'collinear'
  | 'crossing'
  | 'too_small';

const EARTH_RADIUS_M = 6371008.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;

type XY = { x: number; y: number };

// Local equirectangular projection (metres) — accurate enough for areas of
// a few km and avoids pulling in the Google geometry library for validation.
function project(points: GeoPoint[]): XY[] {
  const lat0 = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const cos = Math.cos(toRad(lat0));
  return points.map((p) => ({
    x: toRad(p.lng) * EARTH_RADIUS_M * cos,
    y: toRad(p.lat) * EARTH_RADIUS_M,
  }));
}

function cross(o: XY, a: XY, b: XY) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function segmentsIntersect(a: XY, b: XY, c: XY, d: XY) {
  const d1 = cross(a, b, c);
  const d2 = cross(a, b, d);
  const d3 = cross(c, d, a);
  const d4 = cross(c, d, b);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

/** Area of the polygon in square metres (shoelace). */
export function polygonAreaM2(points: GeoPoint[]): number {
  if (points.length < 3) return 0;
  const xy = project(points);
  let sum = 0;
  for (let i = 0; i < xy.length; i++) {
    const j = (i + 1) % xy.length;
    sum += xy[i].x * xy[j].y - xy[j].x * xy[i].y;
  }
  return Math.abs(sum) / 2;
}

/**
 * Mirrors the server-side rules: 4 points, distinct, no 3 collinear,
 * edges 1-2/3-4 and 2-3/4-1 must not cross, area >= 2,500 m².
 * Returns null when the shape is valid (or incomplete: fewer than 4 points
 * is reported as `count` only when `requireComplete` is set).
 */
export function validateShape(
  points: GeoPoint[],
  requireComplete = true
): GeoShapeError | null {
  if (points.length !== REQUIRED_POINTS) {
    return requireComplete ? 'count' : null;
  }

  const xy = project(points);

  for (let i = 0; i < xy.length; i++) {
    for (let j = i + 1; j < xy.length; j++) {
      const dist = Math.hypot(xy[i].x - xy[j].x, xy[i].y - xy[j].y);
      if (dist < 0.5) return 'distinct';
    }
  }

  const triples = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
  ];
  for (const [i, j, k] of triples) {
    // Twice the triangle area, in m². < 1 m² means "on a straight line".
    if (Math.abs(cross(xy[i], xy[j], xy[k])) / 2 < 1) return 'collinear';
  }

  if (
    segmentsIntersect(xy[0], xy[1], xy[2], xy[3]) ||
    segmentsIntersect(xy[1], xy[2], xy[3], xy[0])
  ) {
    return 'crossing';
  }

  if (polygonAreaM2(points) < MIN_AREA_M2) return 'too_small';

  return null;
}

// Wrapped in an LTR isolate so "2,500 m²" doesn't get reordered in RTL pages.
export function formatArea(areaM2: number): string {
  const text =
    areaM2 >= 1_000_000
      ? `${(areaM2 / 1_000_000).toFixed(2)} km²`
      : `${Math.round(areaM2).toLocaleString('en-US')} m²`;
  return `⁦${text}⁩`;
}

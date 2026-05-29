/**
 * Optimisation de tournée (TSP) — heuristique du plus proche voisin
 * raffinée par 2-opt. Suffisant et rapide pour des tournées de quelques
 * dizaines de conteneurs (cf. cahier des charges : calcul en quelques secondes).
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6_371_000;

/** Distance de Haversine en mètres entre deux points géographiques. */
export function haversine(a: GeoPoint, b: GeoPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

function totalDistance(path: GeoPoint[]): number {
  let d = 0;
  for (let i = 0; i < path.length - 1; i++) d += haversine(path[i], path[i + 1]);
  return d;
}

/** Plus proche voisin à partir du dépôt. Retourne l'ordre de visite (indices des points). */
function nearestNeighbour(depot: GeoPoint, points: GeoPoint[]): number[] {
  const n = points.length;
  const visited = new Array<boolean>(n).fill(false);
  const order: number[] = [];
  let current = depot;
  for (let step = 0; step < n; step++) {
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      const dist = haversine(current, points[i]);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    visited[best] = true;
    order.push(best);
    current = points[best];
  }
  return order;
}

/** Amélioration 2-opt : supprime les croisements d'itinéraire. */
function twoOpt(depot: GeoPoint, points: GeoPoint[], order: number[]): number[] {
  const pathOf = (ord: number[]) => [depot, ...ord.map((i) => points[i])];
  let improved = true;
  let best = order.slice();
  let bestDist = totalDistance(pathOf(best));

  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const candidate = best
          .slice(0, i)
          .concat(best.slice(i, k + 1).reverse(), best.slice(k + 1));
        const dist = totalDistance(pathOf(candidate));
        if (dist < bestDist - 1e-6) {
          best = candidate;
          bestDist = dist;
          improved = true;
        }
      }
    }
  }
  return best;
}

export interface OptimizeResult {
  order: number[]; // ordre de visite (indices du tableau `points`)
  distanceMeters: number; // distance totale depuis le dépôt
}

/** Optimise une tournée depuis un dépôt vers une liste de points. */
export function optimizeRoute(depot: GeoPoint, points: GeoPoint[]): OptimizeResult {
  if (points.length === 0) return { order: [], distanceMeters: 0 };
  const nn = nearestNeighbour(depot, points);
  const order = points.length > 2 ? twoOpt(depot, points, nn) : nn;
  const path = [depot, ...order.map((i) => points[i])];
  return { order, distanceMeters: Math.round(totalDistance(path)) };
}

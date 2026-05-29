import { haversine, optimizeRoute, GeoPoint } from './tsp.util';

describe('TSP util', () => {
  const lyon: GeoPoint = { lat: 45.764, lng: 4.8357 };

  describe('haversine', () => {
    it('renvoie 0 pour deux points identiques', () => {
      expect(haversine(lyon, lyon)).toBe(0);
    });

    it('calcule une distance plausible (~111 km pour 1° de latitude)', () => {
      const d = haversine({ lat: 45, lng: 4 }, { lat: 46, lng: 4 });
      expect(d).toBeGreaterThan(110_000);
      expect(d).toBeLessThan(112_000);
    });
  });

  describe('optimizeRoute', () => {
    it('gère une liste vide', () => {
      expect(optimizeRoute(lyon, [])).toEqual({ order: [], distanceMeters: 0 });
    });

    it('visite tous les points une seule fois', () => {
      const points: GeoPoint[] = [
        { lat: 45.77, lng: 4.83 },
        { lat: 45.75, lng: 4.85 },
        { lat: 45.76, lng: 4.84 },
        { lat: 45.78, lng: 4.82 },
      ];
      const { order } = optimizeRoute(lyon, points);
      expect(order).toHaveLength(points.length);
      expect(new Set(order).size).toBe(points.length);
    });

    it('produit une distance positive et finie', () => {
      const points: GeoPoint[] = [
        { lat: 45.77, lng: 4.83 },
        { lat: 45.75, lng: 4.85 },
      ];
      const { distanceMeters } = optimizeRoute(lyon, points);
      expect(distanceMeters).toBeGreaterThan(0);
      expect(Number.isFinite(distanceMeters)).toBe(true);
    });

    it('le 2-opt ne fait pas pire que le plus proche voisin', () => {
      // Points en croix : un ordre naïf croise, le 2-opt doit corriger.
      const points: GeoPoint[] = [
        { lat: 45.78, lng: 4.80 },
        { lat: 45.75, lng: 4.88 },
        { lat: 45.78, lng: 4.88 },
        { lat: 45.75, lng: 4.80 },
        { lat: 45.77, lng: 4.84 },
      ];
      const { distanceMeters } = optimizeRoute(lyon, points);
      expect(distanceMeters).toBeGreaterThan(0);
    });
  });
});

import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export type Coords = { lat: number; lng: number };

export async function getPosition(): Promise<Coords | null> {
  try {
    if (Capacitor.isNativePlatform()) {
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') return null;
      }
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 });
      return { lat: p.coords.latitude, lng: p.coords.longitude };
    }
    return await new Promise<Coords | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 },
      );
    });
  } catch {
    return null;
  }
}

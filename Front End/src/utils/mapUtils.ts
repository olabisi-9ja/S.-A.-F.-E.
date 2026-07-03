import { Incident } from '../types';

export interface Hotspot {
  latitude: number;
  longitude: number;
  count: number;
  label: string;
}

export function getRealHotspots(incidents: Incident[]): Hotspot[] {
  const grid = new Map<string, Hotspot>();
  
  incidents.forEach(inc => {
    if (!inc.latitude || !inc.longitude) return;
    
    // Round to 3 decimal places (approx ~110 meters at the equator)
    const lat = parseFloat(Number(inc.latitude).toFixed(3));
    const lng = parseFloat(Number(inc.longitude).toFixed(3));
    const key = `${lat},${lng}`;

    if (!grid.has(key)) {
      grid.set(key, { latitude: lat, longitude: lng, count: 0, label: 'Incident Cluster' });
    }
    grid.get(key)!.count += 1;
  });

  // Return only areas with more than 1 incident, sorted by most incidents
  return Array.from(grid.values())
    .filter(h => h.count > 1)
    .sort((a, b) => b.count - a.count)
    .map((h, i) => ({
      ...h,
      label: `Hotspot Zone ${String.fromCharCode(65 + i)}` // Hotspot Zone A, B, etc.
    }));
}

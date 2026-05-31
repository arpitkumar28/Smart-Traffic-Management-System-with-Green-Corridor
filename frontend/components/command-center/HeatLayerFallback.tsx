"use client";

import { useEffect } from "react";
import { mapSensors } from "../../lib/commandCenterData";

export function HeatLayerFallback({ map, L }: { map: any; L: any }) {
  useEffect(() => {
    if (!map || !L) return;
    let heatLayer: any = null;

    // Load leaflet.heat at runtime via CDN if not already present
    (async () => {
      try {
        const points = mapSensors.map((s) => [s.position[0], s.position[1], s.status === 'priority' ? 1.0 : s.status === 'red' ? 0.9 : 0.45]);
        const opts = { radius: 28, blur: 24, max: 1 };

        const createHeat = () => {
          if ((L as any).heatLayer) {
            heatLayer = (L as any).heatLayer(points, opts).addTo(map);
          }
        };

        if ((L as any).heatLayer) {
          createHeat();
        } else {
          const src = 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js';
          const existing = document.querySelector(`script[src="${src}"]`);
          if (!existing) {
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = () => createHeat();
            s.onerror = () => console.warn('Failed to load leaflet.heat from CDN');
            document.head.appendChild(s);
          } else {
            createHeat();
          }
        }
      } catch (e) {
        console.warn('leaflet.heat could not be initialized', e);
      }
    })();

    return () => {
      if (heatLayer && map && map.removeLayer) map.removeLayer(heatLayer);
    };
  }, [map, L]);

  return null;
}

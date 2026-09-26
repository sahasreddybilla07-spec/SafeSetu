import { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';

const ROUTING_URL = 'https://router.project-osrm.org/route/v1/driving';

export default function RoadRoute({ start, end, color = '#159a62' }) {
  const [positions, setPositions] = useState([start, end]);

  useEffect(() => {
    const controller = new AbortController();
    const coordinates = `${start[1]},${start[0]};${end[1]},${end[0]}`;

    fetch(`${ROUTING_URL}/${coordinates}?overview=full&geometries=geojson`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Route unavailable')))
      .then((route) => {
        const roadPositions = route.routes?.[0]?.geometry?.coordinates?.map(([longitude, latitude]) => [latitude, longitude]);
        if (roadPositions?.length > 1) setPositions([start, ...roadPositions, end]);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [start, end]);

  return <Polyline pathOptions={{ color, opacity: 0.95, weight: 3.5 }} positions={positions} />;
}

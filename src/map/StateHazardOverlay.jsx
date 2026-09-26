import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';

const INDIA_STATES_GEOJSON_URL = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';
const regionNames = {
  'Andaman & Nicobar': 'Andaman and Nicobar',
  'Delhi NCR': 'Delhi',
  Odisha: 'Orissa',
  Uttarakhand: 'Uttaranchal',
};

export default function StateHazardOverlay({ incidents }) {
  const [boundaries, setBoundaries] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(INDIA_STATES_GEOJSON_URL)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('State boundaries unavailable')))
      .then((geojson) => { if (active) setBoundaries(geojson); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!boundaries) return null;

  const activeRegions = new Set(incidents.map((incident) => regionNames[incident.region] ?? incident.region));
  const highlightedBoundaries = {
    ...boundaries,
    features: boundaries.features.filter((feature) => activeRegions.has(feature.properties?.NAME_1 ?? feature.properties?.st_nm)),
  };

  return <GeoJSON data={highlightedBoundaries} key={highlightedBoundaries.features.map((feature) => feature.properties?.NAME_1).join('-')} pathOptions={{ className: 'state-hazard-overlay', color: '#d9b95a', fillColor: '#f4c542', fillOpacity: 0.12, weight: 0.8 }} />;
}
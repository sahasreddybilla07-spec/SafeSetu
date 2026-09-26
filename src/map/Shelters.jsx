import { CircleMarker, Popup } from 'react-leaflet';
import floodData from '../data/flood';
import hyderabadCycloneData from '../data/hyderabadCyclone';
import landslideData from '../data/landslide';
import SafeAreaDots from './SafeAreaDots';

const scenarios = { flood: floodData, landslide: landslideData, cyclone: hyderabadCycloneData };

function scenarioSeed(value) {
  return [...value].reduce((seed, character) => ((seed * 31) + character.charCodeAt(0)) % 997, 23);
}

function seededValue(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export default function Shelters({ scenario = 'flood' }) {
  const scenarioData = scenarios[scenario];
  const shelters = scenarioData.shelters;
  const safeAreaCount = 3 + Math.floor(seededValue(scenarioSeed(scenario)) * 3);
  const generatedSafeAreas = Array.from({ length: safeAreaCount }, (_, index) => ({
    id: `${scenario}-safe-area-${index + 1}`,
    name: `${scenarioData.name} Safe Area ${index + 1}`,
    position: [
      scenarioData.center[0] + (seededValue(scenarioSeed(scenario) + index * 17) - 0.5) * 0.06,
      scenarioData.center[1] + (seededValue(scenarioSeed(scenario) + index * 29 + 7) - 0.5) * 0.08,
    ],
    capacity: 'Available evacuation capacity',
  }));

  return [<SafeAreaDots areas={[...shelters, ...generatedSafeAreas]} key="safe-area-dots" />, ...shelters.map((shelter) => (
    <CircleMarker
      center={shelter.position}
      key={shelter.name}
      pathOptions={{ color: '#155ca3', fillColor: '#ffffff', fillOpacity: 1, weight: 3 }}
      radius={8}
    >
      <Popup>
        <strong>Evacuation Shelter</strong><br />
        {shelter.name}<br />
        Capacity: {shelter.capacity}
      </Popup>
    </CircleMarker>
  ))];
}

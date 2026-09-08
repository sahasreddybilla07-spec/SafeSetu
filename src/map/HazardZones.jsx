import { Polygon, Tooltip } from 'react-leaflet';
import floodData from '../data/flood';
import hyderabadCycloneData from '../data/hyderabadCyclone';
import landslideData from '../data/landslide';

const scenarios = { flood: floodData, landslide: landslideData, cyclone: hyderabadCycloneData };

export default function HazardZones({ onRampurZoneClick, scenario = 'flood', whatIfLevel }) {
  const scenarioData = scenarios[scenario];
  const hazardZones = scenarioData.zones.map((zone, index) => (
    index === 0 && whatIfLevel ? { ...zone, positions: scenarioData.whatIf[whatIfLevel].footprint } : zone
  ));
  return hazardZones.map((zone) => (
    <Polygon
      eventHandlers={zone.id === 'rampur' && onRampurZoneClick ? { click: onRampurZoneClick } : undefined}
      key={zone.id}
      pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.28, weight: 2 }}
      positions={zone.positions}
    >
      <Tooltip sticky>
        <strong>{zone.label}</strong><br />{zone.risk}
      </Tooltip>
    </Polygon>
  ));
}

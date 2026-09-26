import { Polygon, Tooltip } from 'react-leaflet';
import floodData from '../data/flood';
import hyderabadCycloneData from '../data/hyderabadCyclone';
import landslideData from '../data/landslide';
import HazardRipple from './HazardRipple';

const scenarios = { flood: floodData, landslide: landslideData, cyclone: hyderabadCycloneData };

export default function HazardZones({ onRampurZoneClick, scenario = 'flood', whatIfLevel }) {
  const scenarioData = scenarios[scenario];
  const hazardZones = scenarioData.zones.map((zone, index) => (
    index === 0 && whatIfLevel ? { ...zone, positions: scenarioData.whatIf[whatIfLevel].footprint } : zone
  ));
  return hazardZones.flatMap((zone, index) => [
    <Polygon
      eventHandlers={zone.id === 'rampur' && onRampurZoneClick ? { click: onRampurZoneClick } : undefined}
      key={zone.id}
      pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.28, weight: 2 }}
      positions={zone.positions}
    >
      <Tooltip sticky>
        <strong>{zone.label}</strong><br />{zone.risk}
      </Tooltip>
    </Polygon>,
    ...(index === 0 ? [<HazardRipple center={scenarioData.center} color={zone.color} key={`${zone.id}-ripple`} radius={7200} />] : []),
  ]);
}

import { Polyline, Tooltip } from 'react-leaflet';
import floodData from '../data/flood';
import hyderabadCycloneData from '../data/hyderabadCyclone';
import landslideData from '../data/landslide';

const scenarios = { flood: floodData, landslide: landslideData, cyclone: hyderabadCycloneData };

export default function EvacuationRoute({ scenario = 'flood' }) {
  return (
    <Polyline
      pathOptions={{ color: '#155ca3', dashArray: '8 8', opacity: 0.9, weight: 4 }}
      positions={scenarios[scenario].route}
    >
      <Tooltip>Suggested evacuation route</Tooltip>
    </Polyline>
  );
}

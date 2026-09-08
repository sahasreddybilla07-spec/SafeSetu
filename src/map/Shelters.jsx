import { CircleMarker, Popup } from 'react-leaflet';
import floodData from '../data/flood';
import hyderabadCycloneData from '../data/hyderabadCyclone';
import landslideData from '../data/landslide';

const scenarios = { flood: floodData, landslide: landslideData, cyclone: hyderabadCycloneData };

export default function Shelters({ scenario = 'flood' }) {
  const shelters = scenarios[scenario].shelters;
  return shelters.map((shelter) => (
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
  ));
}

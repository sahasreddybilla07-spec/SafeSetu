import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

const userLocationIcon = L.divIcon({
  className: 'user-location-marker-wrapper',
  html: '<div class="user-location-marker"><span></span></div>',
  iconSize: [34, 42],
  iconAnchor: [17, 42],
  popupAnchor: [0, -38],
});

export default function UserLocationMarker({ position, label = 'Your Location' }) {
  return (
    <Marker icon={userLocationIcon} position={position}>
      <Popup>
        <strong>{label}</strong><br />
        Current location
      </Popup>
    </Marker>
  );
}

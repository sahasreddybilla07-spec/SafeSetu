import { useEffect, useMemo } from 'react';
import { ArrowLeft, MapPinned, Navigation, ShieldCheck, Users } from 'lucide-react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getHazardDemoData } from '../data/hazardDemo';

const safeAreaMarkerIcon = L.divIcon({
  className: 'safe-area-map-marker-wrapper',
  html: '<div class="safe-area-map-marker">⌖</div>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -20],
});

function statusLabel(status) {
  return status === 'APPROVED' ? 'Government approved' : status === 'REJECTED' ? 'Rejected' : 'Pending review';
}

export default function ControlRoomLocationMap() {
  const navigate = useNavigate();
  const { locationId } = useParams();
  const { hazard, safeArea } = useMemo(() => {
    const data = getHazardDemoData();
    const matchingHazard = data.hazards.find((item) =>
      item.relocationAreas.some((area) => area.id === locationId),
    );

    return {
      hazard: matchingHazard ?? null,
      safeArea: matchingHazard?.relocationAreas.find((area) => area.id === locationId) ?? null,
    };
  }, [locationId]);

  useEffect(() => {
    if (localStorage.getItem('safesetu-gov-auth') !== 'true') {
      navigate('/government/login', { replace: true });
    }
  }, [navigate]);

  if (!safeArea || !hazard) {
    return (
      <main className="control-room-location-map control-room-location-map--empty">
        <p>LOCATION UNAVAILABLE</p>
        <h1>Safe area not found</h1>
        <button onClick={() => navigate('/government/control-room')} type="button">
          <ArrowLeft size={16} /> Back to Control Room
        </button>
      </main>
    );
  }

  return (
    <main className="control-room-location-map">
      <header className="control-room-location-map__header">
        <div className="control-room-location-map__brand">
          <img alt="" aria-hidden="true" src="/logo.svg" />
          <div>
            <p>CONTROL ROOM / SAFE AREA LOCATION</p>
            <h1>{safeArea.name}</h1>
            <span>{safeArea.address}</span>
          </div>
        </div>
        <button className="control-room-location-map__back" onClick={() => navigate('/government/control-room')} type="button">
          <ArrowLeft size={16} /> Back to Control Room
        </button>
      </header>

      <section className="control-room-location-map__content" aria-label={`${safeArea.name} map and details`}>
        <article className="control-room-location-map__panel">
          <div className="control-room-location-map__map-heading">
            <span><MapPinned size={17} /> Exact safe-area location</span>
            <span className={`control-room-location-map__status control-room-location-map__status--${safeArea.approvalStatus.toLowerCase()}`}>
              {statusLabel(safeArea.approvalStatus)}
            </span>
          </div>
          <div className="control-room-location-map__frame">
            <MapContainer center={safeArea.position} className="control-room-location-map__map" scrollWheelZoom zoom={13}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Circle
                center={safeArea.position}
                pathOptions={{ color: '#1f9d63', fillColor: '#44c486', fillOpacity: 0.12, weight: 2 }}
                radius={600}
              />
              <Marker icon={safeAreaMarkerIcon} position={safeArea.position}>
                <Popup>
                  <strong>{safeArea.name}</strong>
                  <br />
                  {safeArea.address}
                  <br />
                  {statusLabel(safeArea.approvalStatus)}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </article>

        <aside className="control-room-location-map__details" aria-label="Safe area details">
          <div className="control-room-location-map__details-heading">
            <ShieldCheck size={20} />
            <div>
              <p>SAFE AREA DETAILS</p>
              <h2>Operational readiness</h2>
            </div>
          </div>
          <dl>
            <div><dt>Associated hazard</dt><dd>{hazard.name}</dd></div>
            <div><dt>Coordinates</dt><dd>{safeArea.latitude.toFixed(4)}, {safeArea.longitude.toFixed(4)}</dd></div>
            <div><dt>Available capacity</dt><dd><Users size={15} /> {safeArea.available.toLocaleString('en-IN')} people</dd></div>
            <div><dt>Current occupancy</dt><dd>{safeArea.occupancy}%</dd></div>
            <div><dt>Route status</dt><dd>{safeArea.routeStatus}</dd></div>
            <div><dt>Travel estimate</dt><dd><Navigation size={15} /> {safeArea.travelTime} · {safeArea.distanceKm} km</dd></div>
          </dl>
        </aside>
      </section>
    </main>
  );
}

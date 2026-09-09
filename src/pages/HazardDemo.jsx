import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  MapPinned,
  Navigation,
  ShieldCheck,
  Users,
  Waves,
} from 'lucide-react';
import L from 'leaflet';
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { hazardDemoData, hazardDemoPrecautions } from '../data/hazardDemo';

const hazardMarkerIcon = L.divIcon({
  className: 'hazard-demo-marker-wrapper',
  html: '<div class="hazard-demo-marker">⚠</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const userMarkerIcon = L.divIcon({
  className: 'hazard-demo-marker-wrapper',
  html: '<div class="hazard-demo-user-marker">●</div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const shelterMarkerIcon = L.divIcon({
  className: 'hazard-demo-marker-wrapper',
  html: '<div class="hazard-demo-shelter-marker">⌂</div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function getOccupancyTone(value) {
  if (value >= 75) return 'critical';
  if (value >= 55) return 'warning';
  return 'safe';
}

function getNavigationUrl(destination) {
  const start = hazardDemoData.userLocation.position;
  const from = encodeURIComponent(`${start[0]},${start[1]}`);
  const to = encodeURIComponent(`${destination.latitude},${destination.longitude}`);
  const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&from=${from}&to=${to}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${destination.name} @ ${destination.latitude}, ${destination.longitude}`)}`;
  return { googleMapsUrl, osmUrl };
}

export default function HazardDemo() {
  const approvedRelocationAreas = useMemo(
    () => hazardDemoData.relocationAreas.filter((area) => area.approved),
    []
  );

  const [selectedAreaId, setSelectedAreaId] = useState(approvedRelocationAreas[0]?.id ?? null);

  const selectedArea =
    approvedRelocationAreas.find((area) => area.id === selectedAreaId) ?? approvedRelocationAreas[0] ?? null;

  function handleNavigation() {
    if (!selectedArea) return;
    const { osmUrl } = getNavigationUrl(selectedArea);
    window.open(osmUrl, '_blank', 'noopener,noreferrer');
  }

  function scrollToHazardDetails() {
    document.getElementById('hazard-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="hazard-demo-page">
      <header className="hazard-demo-header">
        <div className="hazard-demo-header__brand">
          <span className="navbar__mark" aria-hidden="true">S</span>
          <span>SAFESETU</span>
        </div>
        <div className="hazard-demo-header__actions">
          <span className="hazard-demo-header__tag">DEMO SCENARIO • ILLUSTRATIVE DATA</span>
        </div>
      </header>

      <main className="hazard-demo-main">
        <section className="hazard-demo-banner" aria-label="Active hazard warning banner">
          <button className="hazard-demo-banner__badge" onClick={scrollToHazardDetails} type="button">
            <AlertTriangle className="hazard-demo-banner__icon" size={20} />
            <span>
              <strong>ACTIVE HAZARD</strong>
              <em>CYCLONE — ODISHA COAST</em>
            </span>
          </button>

          <div className="hazard-demo-banner__meta">
            <span className="hazard-demo-banner__risk">CRITICAL RISK</span>
            <span className="hazard-demo-banner__status">PROTOTYPE / DEMO ONLY</span>
          </div>
        </section>

        <section className="hazard-demo-grid">
          <div className="hazard-demo-map-panel">
            <div className="hazard-demo-map-panel__header">
              <div>
                <p className="eyebrow">Hazard map</p>
                <h2>Active Scenario Overview</h2>
              </div>
              <span className="hazard-demo-map-panel__chip">⚠ ACTIVE</span>
            </div>

            <div className="hazard-demo-map-frame">
              <MapContainer className="hazard-demo-map" center={[20.6, 85.8]} scrollWheelZoom zoom={6.5}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Circle
                  center={hazardDemoData.hazardCenter}
                  pathOptions={{ color: '#d9485f', fillColor: '#d9485f', fillOpacity: 0.22, weight: 2 }}
                  radius={hazardDemoData.hazardRadius}
                />

                <Circle
                  center={hazardDemoData.hazardCenter}
                  pathOptions={{ color: '#ff9f43', fillColor: '#ff9f43', fillOpacity: 0.12, weight: 1.5 }}
                  radius={hazardDemoData.hazardRadius * 0.65}
                />

                <Marker icon={hazardMarkerIcon} position={hazardDemoData.hazardCenter}>
                  <Popup>
                    <strong>{hazardDemoData.type}</strong>
                    <br />
                    {hazardDemoData.name}
                  </Popup>
                </Marker>

                <Marker icon={userMarkerIcon} position={hazardDemoData.userLocation.position}>
                  <Popup>
                    <strong>{hazardDemoData.userLocation.label}</strong>
                    <br />
                    Demo user location
                  </Popup>
                </Marker>

                {approvedRelocationAreas.map((area) => (
                  <CircleMarker
                    center={area.position}
                    eventHandlers={{ click: () => setSelectedAreaId(area.id) }}
                    key={area.id}
                    pathOptions={{
                      color: selectedAreaId === area.id ? '#1d8f5f' : '#0d6bc0',
                      fillColor: '#ffffff',
                      fillOpacity: 1,
                      weight: selectedAreaId === area.id ? 4 : 2,
                    }}
                    radius={selectedAreaId === area.id ? 10 : 8}
                  >
                    <Popup>
                      <strong>{area.name}</strong>
                      <br />
                      {area.routeStatus}
                    </Popup>
                  </CircleMarker>
                ))}

                {selectedArea && (
                  <Polyline
                    pathOptions={{ color: '#1d67c6', dashArray: '10 8', weight: 4, opacity: 0.9 }}
                    positions={[hazardDemoData.userLocation.position, selectedArea.position]}
                  />
                )}
              </MapContainer>

              <div className="hazard-demo-map__legend">
                <span>
                  <i className="hazard-demo-map__dot hazard-demo-map__dot--critical" />Critical / High Risk
                </span>
                <span>
                  <i className="hazard-demo-map__dot hazard-demo-map__dot--orange" />Moderate Risk
                </span>
                <span>
                  <i className="hazard-demo-map__dot hazard-demo-map__dot--green" />Safe Area
                </span>
                <span>
                  <i className="hazard-demo-map__dot hazard-demo-map__dot--user" />Your Location
                </span>
              </div>
            </div>
          </div>

          <aside className="hazard-demo-sidebar" id="hazard-details">
            <div className="hazard-demo-card hazard-demo-card--solid">
              <p className="eyebrow">Active hazard</p>
              <h2>{hazardDemoData.type}</h2>
              <p className="hazard-demo-card__location">{hazardDemoData.name}</p>
              <div className="hazard-demo-card__info-grid">
                <div>
                  <span>Risk Level</span>
                  <strong>{hazardDemoData.severity}</strong>
                </div>
                <div>
                  <span>People at Risk</span>
                  <strong>{hazardDemoData.peopleAtRisk.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span>Estimated Region</span>
                  <strong>{hazardDemoData.affectedRegion}</strong>
                </div>
                <div>
                  <span>Recommended Action</span>
                  <strong>{hazardDemoData.recommendedAction}</strong>
                </div>
              </div>
              <div className="hazard-demo-card__meta">
                <span>
                  <Clock3 size={14} /> Last Updated: {hazardDemoData.lastUpdated}
                </span>
                <span>
                  <ShieldCheck size={14} /> Status: {hazardDemoData.status}
                </span>
              </div>
            </div>

            <div className="hazard-demo-card">
              <p className="eyebrow">Safety response</p>
              <h3>Hazard Information</h3>
              <ul className="hazard-demo-list">
                <li>
                  <MapPinned size={15} />
                  <span>Risk zone forecast: Odisha coastal belt, low-lying corridor and major road approaches</span>
                </li>
                <li>
                  <Users size={15} />
                  <span>Vulnerable groups are being monitored for relocation and shelter support</span>
                </li>
                <li>
                  <Waves size={15} />
                  <span>Storm surge and high winds are expected to intensify through the evening</span>
                </li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="hazard-demo-section" aria-label="Safety precautions">
          <div className="hazard-demo-section__header">
            <p className="eyebrow">Precautions</p>
            <h3>Safety Precautions</h3>
          </div>

          <div className="hazard-demo-precautions-grid">
            {hazardDemoPrecautions.map((group) => (
              <div className="hazard-demo-precaution-card" key={group.title}>
                <h4>{group.title}</h4>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="hazard-demo-section" aria-label="Approved relocation areas">
          <div className="hazard-demo-section__header hazard-demo-section__header--row">
            <div>
              <p className="eyebrow">Approved relocation areas</p>
              <h3>APPROVED RELOCATION AREAS</h3>
            </div>
            <span className="hazard-demo-section__subhead">Safe locations approved by the Government Control Room</span>
          </div>

          <div className="hazard-demo-relocation-grid">
            {approvedRelocationAreas.map((area) => {
              const availableSpaces = Math.round(area.capacity * (1 - area.occupancy / 100));
              const occupancyTone = getOccupancyTone(area.occupancy);
              const isSelected = selectedAreaId === area.id;

              return (
                <article className={`hazard-demo-relocation-card${isSelected ? ' is-selected' : ''}`} key={area.id}>
                  <div className="hazard-demo-relocation-card__top">
                    <div>
                      <span className="hazard-demo-relocation-card__badge">Government Approved</span>
                      <h4>{area.name}</h4>
                    </div>
                    <span className="hazard-demo-relocation-card__risk">{area.risk}</span>
                  </div>

                  <div className="hazard-demo-relocation-card__stats">
                    <div>
                      <span>Distance</span>
                      <strong>{area.distanceKm} km</strong>
                    </div>
                    <div>
                      <span>Travel time</span>
                      <strong>{area.travelTimeMinutes} min</strong>
                    </div>
                    <div>
                      <span>Safest Route</span>
                      <strong>{area.safetyScore}%</strong>
                    </div>
                  </div>

                  <div className="hazard-demo-relocation-card__score">
                    <span>{area.safetyScore}%</span>
                    <small>SAFEST ROUTE</small>
                  </div>

                  <div className="hazard-demo-relocation-card__capacity">
                    <div className="hazard-demo-relocation-card__capacity-head">
                      <span>Capacity</span>
                      <strong>{area.capacity} people</strong>
                    </div>
                    <div className="hazard-demo-relocation-card__bar">
                      <span className={`hazard-demo-relocation-card__bar-fill hazard-demo-relocation-card__bar-fill--${occupancyTone}`} style={{ width: `${area.occupancy}%` }} />
                    </div>
                    <div className="hazard-demo-relocation-card__capacity-meta">
                      <span>Occupancy: {area.occupancy}%</span>
                      <span>{availableSpaces} spaces available</span>
                    </div>
                  </div>

                  <div className="hazard-demo-relocation-card__meta-row">
                    <span>
                      <Navigation size={14} /> Route Status: {area.routeStatus}
                    </span>
                    <span>
                      <ShieldCheck size={14} /> Approved
                    </span>
                  </div>

                  <button className="hazard-demo-relocation-card__action" onClick={() => setSelectedAreaId(area.id)} type="button">
                    {isSelected ? 'SELECTED LOCATION' : 'VIEW ROUTE'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {selectedArea && (
          <section className="hazard-demo-route-panel" aria-label="Selected relocation route">
            <div className="hazard-demo-route-panel__header">
              <div>
                <p className="eyebrow">Selected destination</p>
                <h3>{selectedArea.name}</h3>
              </div>
              <button onClick={handleNavigation} type="button">
                OPEN NAVIGATION
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="hazard-demo-route-panel__details">
              <div>
                <span>Distance</span>
                <strong>{selectedArea.distanceKm} km</strong>
              </div>
              <div>
                <span>Travel time</span>
                <strong>{selectedArea.travelTimeMinutes} min</strong>
              </div>
              <div>
                <span>Safest route</span>
                <strong>{selectedArea.safetyScore}%</strong>
              </div>
              <div>
                <span>Capacity</span>
                <strong>{selectedArea.capacity} people</strong>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

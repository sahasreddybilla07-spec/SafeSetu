import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, TentTree, Waves, X } from 'lucide-react';
import L from 'leaflet';
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useLocation, useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import AlertCard from '../components/AlertCard';
import MapLegend from '../components/MapLegend';
import Navbar from '../components/Navbar';
import ShelterCard from '../components/ShelterCard';
import { hazardGlyph, incidents, indiaCenter, indiaZoom, severityRank, shelters } from '../data/indiaIncidents';

const toneColor = { critical: '#c63737', warning: '#e07b25', safe: '#2d8a5a' };

function hazardIcon(incident, isSelected) {
  return L.divIcon({
    className: 'hazard-marker-wrapper',
    html: `<div class="hazard-marker hazard-marker--${incident.tone}${isSelected ? ' hazard-marker--selected' : ''}">${hazardGlyph(incident.hazard)}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function FlyToController({ focus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo(focus.center, focus.zoom, { duration: 1 });
    }
  }, [focus, map]);
  return null;
}

function IncidentDetails({ incident, onClose }) {
  if (!incident) return null;
  return (
    <aside className="risk-details" aria-labelledby="incident-details-title">
      <button aria-label="Close incident details" className="risk-details__close" onClick={onClose} type="button"><X size={15} /></button>
      <div className="risk-details__heading">
        <p>{incident.hazard} · Demo Scenario</p>
        <h2 id="incident-details-title">{incident.location}</h2>
      </div>
      <div className="risk-details__risk"><span>Severity</span><strong>{incident.severity}</strong></div>
      <dl className="risk-details__metrics">
        <div><dt>Population at Risk</dt><dd>{incident.populationAtRisk}</dd></div>
        <div><dt>Hazard Type</dt><dd>{incident.hazard}</dd></div>
        <div><dt>Region</dt><dd>{incident.region}</dd></div>
      </dl>
      <div className="risk-details__drivers">
        <h3>Situation</h3>
        <ul><li>{incident.reason}</li></ul>
      </div>
      <div className="risk-details__action">
        <span>Recommended Action</span>
        <strong>{incident.action}</strong>
      </div>
    </aside>
  );
}

function DrawerBackdrop({ onClose }) {
  return <div className="public-drawer-backdrop" onClick={onClose} />;
}

export default function PublicMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const drawer = location.hash === '#alerts' ? 'alerts' : location.hash === '#safe-areas' ? 'safe-areas' : null;

  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [selectedShelterId, setSelectedShelterId] = useState(null);
  const [focus, setFocus] = useState(null);

  function closeDrawer() {
    navigate('/#hazard-map', { replace: true });
  }

  function focusIncident(id) {
    const incident = incidents.find((item) => item.id === id);
    if (!incident) return;
    setSelectedIncidentId(id);
    setSelectedShelterId(null);
    setFocus({ center: incident.center, zoom: incident.zoom });
  }

  function focusShelter(id) {
    const shelter = shelters.find((item) => item.id === id);
    if (!shelter) return;
    setSelectedShelterId(id);
    setSelectedIncidentId(null);
    setFocus({ center: shelter.position, zoom: 7.5 });
  }

  function selectFromDrawer(kind, id) {
    if (kind === 'incident') focusIncident(id);
    else focusShelter(id);
    closeDrawer();
  }

  const selectedIncident = incidents.find((item) => item.id === selectedIncidentId) || null;
  const totalPopulation = incidents.reduce((sum, item) => sum + Number(item.populationAtRisk.replace(/,/g, '')), 0);
  const hazardsMonitored = new Set(incidents.map((item) => item.hazard)).size;
  const sortedAlerts = [...incidents].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  return (
    <div className="public-map-page">
      <Navbar />
      <main>
        <section className="public-map-hero" id="hazard-map" aria-labelledby="hazard-map-title">
          <div>
            <p className="eyebrow">National disaster monitoring</p>
            <h1 id="hazard-map-title">SAFESETU — Multi-Hazard Safety Intelligence for India</h1>
            <p className="public-map-hero__description">
              Illustrative demo scenarios using curated data across five regions — not live emergency alerts.
            </p>
          </div>
          <div className="public-map-hero__actions">
            <button className="public-map-hero__cta" onClick={() => navigate('/hazard-demo')} type="button">
              VIEW HAZARD SCENARIO
            </button>
            <span className="demo-badge">DEMO SCENARIO • ILLUSTRATIVE DATA</span>
          </div>
        </section>

        <section className="public-stats-row" aria-label="National monitoring statistics">
          <div className="public-stat"><ShieldAlert size={17} /><div><strong>{incidents.length}</strong><span>Demo Incidents</span></div></div>
          <div className="public-stat"><Waves size={17} /><div><strong>{totalPopulation.toLocaleString('en-IN')}</strong><span>Population at Risk</span></div></div>
          <div className="public-stat"><AlertTriangle size={17} /><div><strong>{hazardsMonitored}</strong><span>Hazards Monitored</span></div></div>
          <div className="public-stat"><TentTree size={17} /><div><strong>{shelters.length}</strong><span>Safe Areas</span></div></div>
        </section>

        <section className="map-workspace" aria-label="India multi-hazard monitoring map">
          <div className="map-frame">
            <MapContainer center={indiaCenter} className="hazard-map" scrollWheelZoom zoom={indiaZoom}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FlyToController focus={focus} />
              {incidents.map((incident) => (
                <Circle
                  center={incident.center}
                  key={`zone-${incident.id}`}
                  pathOptions={{
                    color: toneColor[incident.tone],
                    fillColor: toneColor[incident.tone],
                    fillOpacity: selectedIncidentId === incident.id ? 0.22 : 0.09,
                    weight: selectedIncidentId === incident.id ? 2 : 1,
                  }}
                  radius={incident.zoneRadius}
                />
              ))}
              {incidents.map((incident) => (
                <Marker
                  eventHandlers={{ click: () => focusIncident(incident.id) }}
                  icon={hazardIcon(incident, selectedIncidentId === incident.id)}
                  key={incident.id}
                  position={incident.center}
                >
                  <Popup>
                    <strong>{incident.hazard}</strong><br />
                    {incident.location}<br />
                    {incident.severity} · {incident.populationAtRisk} people at risk<br />
                    Action: {incident.action}
                  </Popup>
                </Marker>
              ))}
              {shelters.map((shelter) => (
                <CircleMarker
                  center={shelter.position}
                  eventHandlers={{ click: () => focusShelter(shelter.id) }}
                  key={shelter.id}
                  pathOptions={{
                    color: '#155ca3',
                    fillColor: '#ffffff',
                    fillOpacity: 1,
                    weight: selectedShelterId === shelter.id ? 4 : 2,
                  }}
                  radius={selectedShelterId === shelter.id ? 10 : 7}
                >
                  <Popup>
                    <strong>Emergency Shelter</strong><br />
                    {shelter.name}<br />
                    Capacity: {shelter.capacity}<br />
                    Status: {shelter.status}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
            <MapLegend showDemoTag showHazardIcon />
            <IncidentDetails incident={selectedIncident} onClose={() => setSelectedIncidentId(null)} />
          </div>

          <aside className="national-status" aria-label="National status summary">
            <div className="national-status__block">
              <div className="national-status__heading"><p className="eyebrow">Public advisories</p><h2>Top Alerts</h2></div>
              {sortedAlerts.slice(0, 3).map((incident) => (
                <AlertCard incident={incident} key={incident.id} onSelect={() => focusIncident(incident.id)} />
              ))}
              <button className="national-status__link" onClick={() => navigate('/#alerts')} type="button">VIEW ALL ALERTS</button>
            </div>
            <div className="national-status__block">
              <h3>Safe Areas</h3>
              <p>Blue shelter markers on the map identify emergency shelters with available capacity.</p>
              <button className="national-status__link" onClick={() => navigate('/#safe-areas')} type="button">VIEW SAFE AREAS</button>
            </div>
          </aside>
        </section>

        <section className="scenario-selector" aria-label="Demo scenario selector">
          <h2>DEMO SCENARIOS</h2>
          <div className="scenario-selector__grid">
            {incidents.map((incident) => (
              <button
                className={`scenario-card scenario-card--${incident.tone}${selectedIncidentId === incident.id ? ' scenario-card--active' : ''}`}
                key={incident.id}
                onClick={() => focusIncident(incident.id)}
                type="button"
              >
                <span aria-hidden="true" className="scenario-card__icon">{hazardGlyph(incident.hazard)}</span>
                <span className="scenario-card__hazard">{incident.hazard}</span>
                <span className="scenario-card__region">{incident.region}</span>
                <span className="scenario-card__severity">{incident.severity}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {drawer === 'alerts' && (
        <>
          <DrawerBackdrop onClose={closeDrawer} />
          <aside className="public-drawer" aria-labelledby="alerts-drawer-title">
            <div className="public-drawer__header">
              <div><p className="eyebrow">Public advisories</p><h2 id="alerts-drawer-title">Active Alerts</h2></div>
              <button aria-label="Close alerts" onClick={closeDrawer} type="button"><X size={18} /></button>
            </div>
            <div className="public-drawer__content">
              {sortedAlerts.map((incident) => (
                <AlertCard incident={incident} key={incident.id} onSelect={() => selectFromDrawer('incident', incident.id)} />
              ))}
            </div>
          </aside>
        </>
      )}

      {drawer === 'safe-areas' && (
        <>
          <DrawerBackdrop onClose={closeDrawer} />
          <aside className="public-drawer" aria-labelledby="safe-areas-drawer-title">
            <div className="public-drawer__header">
              <div><p className="eyebrow">Illustrative demo data</p><h2 id="safe-areas-drawer-title">Safe Areas / Evacuation Centres</h2></div>
              <button aria-label="Close safe areas" onClick={closeDrawer} type="button"><X size={18} /></button>
            </div>
            <div className="public-drawer__content">
              {shelters.map((shelter) => (
                <ShelterCard key={shelter.id} shelter={shelter} onSelect={() => selectFromDrawer('shelter', shelter.id)} />
              ))}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

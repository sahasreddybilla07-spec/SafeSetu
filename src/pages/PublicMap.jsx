import { useEffect, useState } from 'react';
import { Activity, CloudRain, Flame, Mountain, SunMedium, TentTree, Waves, Wind, X } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useLocation, useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import AlertCard from '../components/AlertCard';
import MapLegend from '../components/MapLegend';
import Navbar from '../components/Navbar';
import ShelterCard from '../components/ShelterCard';
import { incidents, indiaCenter, indiaZoom, severityRank, shelters } from '../data/indiaIncidents';

const toneColor = { critical: '#dc2626', high: '#f97316', moderate: '#eab308' };
const hazardIcons = { Flood: Waves, Cyclone: Wind, Landslide: Mountain, Earthquake: Activity, Heatwave: SunMedium, Tsunami: Waves, Wildfire: Flame, 'Heavy Rainfall': CloudRain };

function hazardIcon(incident, isSelected) {
  const HazardIcon = hazardIcons[incident.hazard] ?? Activity;
  return L.divIcon({
    className: 'hazard-marker-wrapper',
    html: `<div class="hazard-marker hazard-marker--${incident.tone}${isSelected ? ' hazard-marker--selected' : ''}"><span class="hazard-marker__pulse"></span>${renderToStaticMarkup(<HazardIcon aria-hidden="true" size={19} strokeWidth={2.55} />)}</div>`,
    iconSize: [42, 42], iconAnchor: [21, 21],
  });
}

function FlyToController({ focus }) {
  const map = useMap();
  useEffect(() => { if (focus) map.flyTo(focus.center, focus.zoom, { duration: 1 }); }, [focus, map]);
  return null;
}

function IncidentDetails({ incident, onClose }) {
  if (!incident) return null;
  return (
    <aside className={`risk-details risk-details--${incident.tone}`} aria-labelledby="incident-details-title">
      <button aria-label="Close incident details" className="risk-details__close" onClick={onClose} type="button"><X size={17} /></button>
      <div className="risk-details__heading"><p>Illustrative {incident.hazard} scenario</p><h2 id="incident-details-title">{incident.location}</h2></div>
      <div className="risk-details__signal"><div><span>Severity</span><strong>{incident.severity}</strong></div><div><span>Population at risk</span><strong>{incident.populationAtRisk}</strong></div></div>
      <dl className="risk-details__metrics">
        <div><dt>Hazard type</dt><dd>{incident.hazard}</dd></div><div><dt>Region</dt><dd>{incident.region}</dd></div>
        {incident.measurements.map((item) => <div className={item.highlight ? 'risk-details__metric--highlight' : ''} key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
      </dl>
      <div className="risk-details__drivers"><h3>Situation</h3><p>{incident.reason}</p></div>
      <div className="risk-details__action"><span>Recommended action</span><strong>{incident.action}</strong></div>
    </aside>
  );
}

function SafeAreaOverlay({ visibleShelters, onSelect, onViewAll }) {
  return (
    <section className="map-overlay-card map-overlay-card--safe" aria-labelledby="safe-area-overlay-title">
      <div className="map-overlay-card__heading"><div><p>Preparedness network</p><h2 id="safe-area-overlay-title">Safe Areas</h2></div><TentTree size={19} aria-hidden="true" /></div>
      <p className="map-overlay-card__intro">Emergency shelters with illustrative available capacity.</p>
      <div className="map-overlay-card__safe-list">
        {visibleShelters.map((shelter) => <button key={shelter.id} onClick={() => onSelect(shelter.id)} type="button"><span><strong>{shelter.name}</strong><small>{shelter.capacity} capacity</small></span><span className="safe-area-status">Available</span></button>)}
      </div>
      <button className="map-overlay-card__link" onClick={onViewAll} type="button">View all safe areas</button>
    </section>
  );
}

function AlertsOverlay({ alerts, onSelect, onViewAll }) {
  return (
    <section className="map-overlay-card map-overlay-card--alerts" aria-labelledby="alerts-overlay-title">
      <div className="map-overlay-card__heading"><div><p>Public advisories</p><h2 id="alerts-overlay-title">Top Alerts</h2></div><span className="map-overlay-card__count">{alerts.length}</span></div>
      <div className="map-overlay-card__alert-list">{alerts.map((incident) => <AlertCard incident={incident} key={incident.id} onSelect={() => onSelect(incident.id)} />)}</div>
      <button className="map-overlay-card__link" onClick={onViewAll} type="button">View all alerts</button>
    </section>
  );
}

export default function PublicMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const drawer = location.hash === '#alerts' ? 'alerts' : location.hash === '#safe-areas' ? 'safe-areas' : null;
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [selectedShelterId, setSelectedShelterId] = useState(null);
  const [focus, setFocus] = useState(null);
  const selectedIncident = incidents.find((item) => item.id === selectedIncidentId) || null;
  const sortedAlerts = [...incidents].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  function closeDrawer() { navigate('/#hazard-map', { replace: true }); }
  function focusIncident(id) { const incident = incidents.find((item) => item.id === id); if (!incident) return; setSelectedIncidentId(id); setSelectedShelterId(null); setFocus({ center: incident.center, zoom: incident.zoom }); }
  function focusShelter(id) { const shelter = shelters.find((item) => item.id === id); if (!shelter) return; setSelectedShelterId(id); setSelectedIncidentId(null); setFocus({ center: shelter.position, zoom: 7.5 }); }
  function selectFromDrawer(kind, id) { kind === 'incident' ? focusIncident(id) : focusShelter(id); closeDrawer(); }

  return (
    <div className="public-map-page">
      <Navbar />
      <main className="public-map-main">
        <section className="public-map-workspace" id="hazard-map" aria-label="Illustrative India multi-hazard monitoring map">
          <MapContainer center={indiaCenter} className="hazard-map" scrollWheelZoom zoom={indiaZoom}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FlyToController focus={focus} />
            {incidents.map((incident) => <Circle center={incident.center} key={`zone-${incident.id}`} pathOptions={{ color: toneColor[incident.tone], fillColor: toneColor[incident.tone], fillOpacity: selectedIncidentId === incident.id ? 0.25 : 0.1, weight: selectedIncidentId === incident.id ? 2.4 : 1.25 }} radius={incident.zoneRadius} />)}
            {incidents.map((incident) => <Marker eventHandlers={{ click: () => focusIncident(incident.id) }} icon={hazardIcon(incident, selectedIncidentId === incident.id)} key={incident.id} position={incident.center}><Popup><strong>{incident.hazard}</strong><br />{incident.location}<br />{incident.severity} · {incident.populationAtRisk} people at risk<br />Action: {incident.action}</Popup></Marker>)}
            {shelters.map((shelter) => <CircleMarker center={shelter.position} eventHandlers={{ click: () => focusShelter(shelter.id) }} key={shelter.id} pathOptions={{ color: '#ffffff', fillColor: '#0f9f6e', fillOpacity: 1, weight: selectedShelterId === shelter.id ? 4 : 2.5 }} radius={selectedShelterId === shelter.id ? 11 : 8}><Popup><strong>Emergency shelter</strong><br />{shelter.name}<br />Capacity: {shelter.capacity}<br />Status: {shelter.status}</Popup></CircleMarker>)}
          </MapContainer>

          <MapLegend collapsible showHazardIcon />
          <p className="map-demo-note">Illustrative scenario data · not live emergency alerts</p>
          <IncidentDetails incident={selectedIncident} onClose={() => setSelectedIncidentId(null)} />
          <aside className="map-overlay-stack" aria-label="Map advisories and safe areas">
            <button className="map-scenario-cta" onClick={() => navigate('/hazard-demo')} type="button">View hazard scenario</button>
            <SafeAreaOverlay onSelect={focusShelter} onViewAll={() => navigate('/#safe-areas')} visibleShelters={shelters.slice(0, 2)} />
            <AlertsOverlay alerts={sortedAlerts.slice(0, 3)} onSelect={focusIncident} onViewAll={() => navigate('/#alerts')} />
          </aside>
        </section>
      </main>

      {drawer === 'alerts' && <><div className="public-drawer-backdrop" onClick={closeDrawer} /><aside className="public-drawer" aria-labelledby="alerts-drawer-title"><div className="public-drawer__header"><div><p className="eyebrow">Illustrative public advisories</p><h2 id="alerts-drawer-title">All Alerts</h2></div><button aria-label="Close alerts" onClick={closeDrawer} type="button"><X size={18} /></button></div><div className="public-drawer__content">{sortedAlerts.map((incident) => <AlertCard incident={incident} key={incident.id} onSelect={() => selectFromDrawer('incident', incident.id)} />)}</div></aside></>}
      {drawer === 'safe-areas' && <><div className="public-drawer-backdrop" onClick={closeDrawer} /><aside className="public-drawer" aria-labelledby="safe-areas-drawer-title"><div className="public-drawer__header"><div><p className="eyebrow">Illustrative preparedness network</p><h2 id="safe-areas-drawer-title">Safe Areas / Evacuation Centres</h2></div><button aria-label="Close safe areas" onClick={closeDrawer} type="button"><X size={18} /></button></div><div className="public-drawer__content">{shelters.map((shelter) => <ShelterCard key={shelter.id} shelter={shelter} onSelect={() => selectFromDrawer('shelter', shelter.id)} />)}</div></aside></>}
    </div>
  );
}

import { AlertTriangle, Building2, MapPinned, ShieldAlert, TentTree, Waves } from 'lucide-react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import IncidentCard from '../components/IncidentCard';
import LiveTicker from '../components/LiveTicker';
import MapLegend from '../components/MapLegend';
import StatCard from '../components/StatCard';
import EvacuationRoute from '../map/EvacuationRoute';
import HazardZones from '../map/HazardZones';
import Shelters from '../map/Shelters';

const placeMarkers = [
  { name: 'Rampur', position: [25.46, 82.792], color: '#d64d4d' },
  { name: 'Kotwa', position: [25.49, 82.83], color: '#e39a45' },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <section className="dashboard__heading">
        <div>
          <p>District command overview</p>
          <h1>Rampur District</h1>
        </div>
        <span>Last updated: 14:44 IST · Demo scenario</span>
      </section>

      <section className="stats-grid" aria-label="District incident statistics">
        <StatCard icon={<AlertTriangle size={19} />} label="Active Incidents" supportingText="Currently active" tone="neutral" value="2" />
        <StatCard icon={<ShieldAlert size={19} />} label="Population at Risk" supportingText="Across active incidents" tone="critical" value="6,240" />
        <StatCard icon={<TentTree size={19} />} label="Shelters Available" supportingText="Currently operational" tone="safe" value="7" />
        <StatCard icon={<Building2 size={19} />} label="Resource Conflicts" supportingText="Requires attention" tone="warning" value="1" />
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel dashboard-map-panel">
          <div className="dashboard-panel__heading">
            <div><p>Geographic overview</p><h2>Hazard Map</h2></div>
            <MapPinned size={19} />
          </div>
          <div className="dashboard-map-frame">
            <MapContainer center={[25.457, 82.816]} className="dashboard-map" scrollWheelZoom zoom={12}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <HazardZones onRampurZoneClick={() => {}} />
              <EvacuationRoute />
              <Shelters />
              {placeMarkers.map((place) => (
                <CircleMarker center={place.position} key={place.name} pathOptions={{ color: '#ffffff', fillColor: place.color, fillOpacity: 1, weight: 2 }} radius={7}>
                  <Popup><strong>{place.name}</strong></Popup>
                </CircleMarker>
              ))}
            </MapContainer>
            <MapLegend dark />
          </div>
          <Link className="dashboard-panel__button" to="/admin/map">OPEN HAZARD MAP</Link>
        </article>

        <aside className="dashboard-right-column">
          <section className="dashboard-panel incidents-panel">
            <div className="dashboard-panel__heading"><div><p>Response queue</p><h2>Active Incidents</h2></div><span className="panel-count">2</span></div>
            <div className="incidents-stack">
              <IncidentCard icon={<Waves size={19} />} incident="Flood" location="Rampur Block" population="3,120" severity="HIGH" status="EVACUATION REQUIRED" tone="critical" />
              <IncidentCard icon={<AlertTriangle size={19} />} incident="Landslide" location="Kotwa Hills" population="3,120" severity="MODERATE" status="RELOCATION ADVISED" tone="warning" />
            </div>
            <Link className="dashboard-panel__button dashboard-panel__button--primary" to="/admin/control-room">OPEN CONTROL ROOM</Link>
          </section>

          <section className="dashboard-panel quick-response">
            <div className="dashboard-panel__heading"><div><p>Operational shortcuts</p><h2>Quick Response</h2></div></div>
            <div className="quick-response__actions">
              <Link to="/admin/map">VIEW HAZARD MAP</Link>
              <Link to="/admin/map#shelters">VIEW SHELTERS</Link>
              <Link to="/admin/control-room">CONTROL ROOM</Link>
            </div>
          </section>
        </aside>
      </section>

      <LiveTicker />
    </div>
  );
}

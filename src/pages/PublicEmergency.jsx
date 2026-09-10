import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, PhoneCall, ShieldCheck } from 'lucide-react';
import { CircleMarker, Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPlanById, readIssuedPlan, readSafetyConfirmed, saveSafetyConfirmed, scenario } from '../data/emergencyScenario';

const startIcon = L.divIcon({
  className: 'hazard-marker-wrapper',
  html: '<div class="hazard-marker hazard-marker--critical">⚠</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const flowSteps = [
  'Government / Disaster Management Authority',
  'Registered Safe Locations',
  'SafeSetu Database',
  'ML + GIS Analysis',
  'Which registered locations are suitable for this particular hazard?',
  'Government Control Room',
  'Final Approval',
  'Public Users',
];

function EmergencyFlow({ activeIndex }) {
  return (
    <ol className="emergency-flow" aria-label="Emergency response flow">
      {flowSteps.map((step, index) => (
        <li className={index <= activeIndex ? 'emergency-flow__step emergency-flow__step--done' : 'emergency-flow__step'} key={step}>
          <span className="emergency-flow__marker">{index <= activeIndex ? <CheckCircle2 size={13} /> : index + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function NoActivePlan() {
  return (
    <div className="emergency-page">
      <header className="emergency-header">
        <div className="emergency-header__brand">SAFESETU <span>EMERGENCY ASSISTANCE</span></div>
        <span className="emergency-header__tag">DEMO CITIZEN VIEW</span>
      </header>
      <main className="emergency-empty">
        <ShieldCheck size={28} />
        <h1>No Evacuation Plan Has Been Issued</h1>
        <p>
          This page shows what an affected citizen sees once a district officer sends an approved evacuation plan.
          Run the demo from the government Hazard Map (Cyclone — Hyderabad scenario) to issue a plan.
        </p>
        <div className="emergency-empty__actions">
          <Link to="/admin/map">Go to Hazard Map</Link>
          <Link to="/">Back to Public Safety Map</Link>
        </div>
      </main>
    </div>
  );
}

export default function PublicEmergency() {
  const [issuedRecord, setIssuedRecord] = useState(null);
  const [safety, setSafety] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIssuedRecord(readIssuedPlan());
    setSafety(readSafetyConfirmed());
    setLoaded(true);
  }, []);

  if (!loaded) return null;
  if (!issuedRecord) return <NoActivePlan />;

  const plan = getPlanById(issuedRecord.planId);
  if (!plan) return <NoActivePlan />;

  function confirmSafety() {
    const record = saveSafetyConfirmed();
    setSafety(record);
  }

  const activeStepIndex = safety ? 7 : 6;

  return (
    <div className="emergency-page">
      <header className="emergency-header">
        <div className="emergency-header__brand">SAFESETU <span>EMERGENCY ASSISTANCE</span></div>
        <span className="emergency-header__tag">DEMO CITIZEN VIEW</span>
      </header>

      <section className="emergency-banner" aria-label="Evacuation order">
        <AlertTriangle size={26} />
        <div>
          <strong>EVACUATION ORDER ISSUED</strong>
          <span>{scenario.location.toUpperCase()}</span>
        </div>
        <span className="emergency-banner__status">STATUS: {scenario.severity}</span>
      </section>

      <main className="emergency-main">
        <div className="emergency-column">
          <section className="emergency-card emergency-card--message">
            <h1>YOU ARE IN AN AFFECTED AREA</h1>
            <p className="emergency-card__lead">EVACUATION IS REQUIRED</p>
            <p>SAFESETU has an officer-approved evacuation plan for your area.</p>
          </section>

          <section className="emergency-card" aria-label="Your evacuation plan">
            <h2>YOUR EVACUATION PLAN</h2>
            <dl className="emergency-plan-facts">
              <div><dt>Leave By</dt><dd>{plan.departure}</dd></div>
              <div><dt>Go To</dt><dd>{plan.destination}</dd></div>
              <div><dt>Estimated Travel</dt><dd>{plan.travelTime}</dd></div>
              <div><dt>Route</dt><dd>{plan.route}</dd></div>
              <div><dt>Shelter Capacity</dt><dd>{plan.capacity}</dd></div>
              <div><dt>Route Risk</dt><dd className={`emergency-risk emergency-risk--${plan.riskTone}`}>{plan.risk}</dd></div>
            </dl>
          </section>

          <section className="emergency-card emergency-card--reassurance">
            <h2>YOU ARE NOT ALONE</h2>
            <p>Your evacuation route and shelter have been identified based on the current emergency scenario.</p>
            <p>Follow the recommended route and proceed to the assigned shelter.</p>
            <p>SAFESETU is designed to help you reach a designated safe area safely.</p>
          </section>

          <section className="emergency-card" aria-label="Before you leave checklist">
            <h2>BEFORE YOU LEAVE</h2>
            <ul className="emergency-checklist">
              <li>Carry essential medicines</li>
              <li>Carry identification / documents</li>
              <li>Take drinking water</li>
              <li>Keep your phone charged</li>
              <li>Follow the designated route</li>
              <li>Do not enter flooded / blocked roads</li>
            </ul>
          </section>

          <section className="emergency-card" aria-label="Emergency contacts">
            <h2>EMERGENCY ASSISTANCE</h2>
            <div className="emergency-contacts">
              <div><PhoneCall size={16} /><div><strong>112</strong><span>National Emergency Number</span></div></div>
              <div><PhoneCall size={16} /><div><strong>District Control Room</strong><span>Available for assistance</span></div></div>
            </div>
          </section>

          <section className="emergency-card emergency-card--safe" aria-label="Safety confirmation">
            {safety ? (
              <p className="emergency-safe-confirmed"><CheckCircle2 size={18} /> SAFETY CONFIRMED<span>Your status has been recorded for this demo.</span></p>
            ) : (
              <button className="emergency-safe-button" onClick={confirmSafety} type="button">
                I&apos;M SAFE / REACHED SHELTER
              </button>
            )}
          </section>
        </div>

        <div className="emergency-column">
          <section className="emergency-card emergency-map-card" aria-label="Evacuation map">
            <h2>ROUTE TO SAFETY</h2>
            <div className="emergency-map-frame">
              <MapContainer center={scenario.center} className="emergency-map" scrollWheelZoom zoom={scenario.zoom}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Circle
                  center={scenario.affectedZone.center}
                  pathOptions={{ color: '#c63737', fillColor: '#c63737', fillOpacity: 0.16, weight: 1.5 }}
                  radius={scenario.affectedZone.radius}
                />
                <Marker icon={startIcon} position={scenario.affectedZone.center}>
                  <Popup><strong>Affected Area</strong><br />{scenario.location}</Popup>
                </Marker>
                <Polyline pathOptions={{ color: '#155ca3', dashArray: '8 8', opacity: 0.9, weight: 4 }} positions={plan.routePositions} />
                <CircleMarker center={plan.shelterPosition} pathOptions={{ color: '#155ca3', fillColor: '#ffffff', fillOpacity: 1, weight: 3 }} radius={9}>
                  <Popup><strong>{plan.destination}</strong><br />Capacity: {plan.capacity}</Popup>
                </CircleMarker>
              </MapContainer>
              <div className="emergency-map-legend">
                <span><i className="emergency-map-legend__dot emergency-map-legend__dot--red" /> Affected Area</span>
                <span><i className="emergency-map-legend__dot emergency-map-legend__dot--blue" /> Evacuation Route</span>
                <span><i className="emergency-map-legend__dot emergency-map-legend__dot--shelter" /> Assigned Shelter</span>
              </div>
            </div>
          </section>

          <section className="emergency-card" aria-label="Response flow">
            <h2>SAFESETU RESPONSE FLOW</h2>
            <EmergencyFlow activeIndex={activeStepIndex} />
          </section>
        </div>
      </main>

      <footer className="emergency-footer">
        <nav className="emergency-footer__nav">
          <Link to="/"><ArrowLeft size={13} /> Back to Public Safety Map</Link>
          <Link to="/admin/map">Return to Government View (Demo)</Link>
        </nav>
        <p>DEMO MODE — This evacuation notification is simulated using illustrative scenario data.</p>
      </footer>
    </div>
  );
}

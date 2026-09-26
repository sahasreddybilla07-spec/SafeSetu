import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  FileWarning,
  MapPinned,
  Navigation,
  ShieldCheck,
  Siren,
  Volume2,
  VolumeX,
  Users,
  Waves,
} from 'lucide-react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { hazardDemoData, hazardDemoPrecautions } from '../data/hazardDemo';
import { createEmergencyAssistanceRequest } from '../data/emergencyAssistance';
import HazardRipple from '../map/HazardRipple';
import RoadRoute from '../map/RoadRoute';
import SafeAreaDots from '../map/SafeAreaDots';
import UserLocationMarker from '../map/UserLocationMarker';

const hazardMarkerIcon = L.divIcon({
  className: 'hazard-demo-marker-wrapper',
  html: '<div class="hazard-demo-marker">⚠</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const shelterMarkerIcon = L.divIcon({
  className: 'hazard-demo-marker-wrapper',
  html: '<div class="hazard-demo-shelter-marker">⌂</div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const severityBaseMinutes = { CRITICAL: 0.35, HIGH: 0.5, MODERATE: 0.75, LOW: 1 };

function calculateBufferMinutes(incident) {
  if (!incident) return 0;

  const population = Number(String(incident.peopleAtRisk ?? 0).replace(/,/g, '')) || 0;
  const hazardBonus =
    incident.type === 'Cyclone'
      ? 0.9
      : incident.type === 'Flood'
        ? 0.7
        : incident.type === 'Landslide'
          ? 0.6
          : incident.type === 'Heatwave'
            ? 0.5
            : 0.8;

  return Math.max(
    0.5,
    Number((severityBaseMinutes[incident.severity] + population / 3000 + hazardBonus).toFixed(2)),
  );
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}h ${minutes}m ${seconds}s`;
}

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

function isRouteUnavailable(area) {
  return ['BLOCKED', 'CLOSED', 'UNSAFE', 'IMPASSABLE'].includes(String(area.roadStatus ?? '').toUpperCase());
}

function isVeryRiskyRoute(area) {
  const risk = String(area.riskLevel ?? area.risk ?? '').toUpperCase();
  const safetyScore = Number(area.safetyScore);

  return isRouteUnavailable(area) || ['HIGH', 'CRITICAL'].includes(risk) || (!Number.isNaN(safetyScore) && safetyScore < 60);
}

export default function HazardDemo() {
  const navigate = useNavigate();
  const approvedRelocationAreas = useMemo(
    () => hazardDemoData.relocationAreas.filter((area) => area.approved),
    []
  );

  const [selectedAreaId, setSelectedAreaId] = useState(approvedRelocationAreas[0]?.id ?? null);
  const [now, setNow] = useState(Date.now());
  const [deadlineAt, setDeadlineAt] = useState(Date.now());
  const [emergencyNotified, setEmergencyNotified] = useState(false);
  const [noEscapeDemo, setNoEscapeDemo] = useState(false);
  const [assistanceId, setAssistanceId] = useState(null);
  const [sirenEnabled, setSirenEnabled] = useState(false);
  const [showSafetyManual, setShowSafetyManual] = useState(false);
  const audioContextRef = useRef(null);
  const sirenIntervalRef = useRef(null);

  const selectedArea =
    approvedRelocationAreas.find((area) => area.id === selectedAreaId) ?? approvedRelocationAreas[0] ?? null;
  const displayedRelocationAreas = noEscapeDemo
    ? approvedRelocationAreas.map((area) => ({ ...area, roadStatus: 'UNSAFE', risk: 'CRITICAL', riskLevel: 'CRITICAL', safetyScore: 20, routeStatus: 'Demonstration: route is unsafe' }))
    : approvedRelocationAreas;
  const viableEscapeRoutes = noEscapeDemo ? [] : approvedRelocationAreas.filter((area) => !isRouteUnavailable(area));
  const hasNoEscapeRoute = viableEscapeRoutes.length === 0;
  const hasOnlyVeryRiskyRoutes = viableEscapeRoutes.length > 0 && viableEscapeRoutes.every(isVeryRiskyRoute);
  const emergencyAvailable = hasNoEscapeRoute || hasOnlyVeryRiskyRoutes;
  const emergencyReason = hasNoEscapeRoute
    ? 'No approved escape route is currently available.'
    : 'All available escape routes are currently very high risk.';
  const assistanceConfirmed = emergencyNotified || Boolean(assistanceId);

  function handleNavigation() {
    if (!selectedArea) return;
    const { osmUrl } = getNavigationUrl(selectedArea);
    window.open(osmUrl, '_blank', 'noopener,noreferrer');
  }

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    const bufferMinutes = calculateBufferMinutes(hazardDemoData);
    setDeadlineAt(Date.now() + bufferMinutes * 60 * 1000);
  }, []);

  const remainingMs = Math.max(0, deadlineAt - now);
  const isExpired = remainingMs <= 0;
  const hazardInstructions = {
    Cyclone: ['Move inland or to an approved shelter before winds intensify.', 'Stay away from windows, coastal areas, bridges, and floodwater.', 'Keep emergency supplies, identity documents, medicines, and drinking water ready.'],
    Flood: ['Move to higher ground and use only routes confirmed by officials.', 'Never walk or drive through moving or unknown-depth water.', 'Switch off electricity if water enters the building and keep children away from drains.'],
    Landslide: ['Leave slopes, valleys, and areas below unstable ground immediately.', 'Watch for falling rocks, cracks, unusual sounds, and suddenly blocked roads.', 'Do not return until officials confirm the route and structure are safe.'],
    Heatwave: ['Move indoors or to a cooling centre and avoid direct sun.', 'Drink water regularly and check on elderly people, children, and vulnerable neighbours.', 'Avoid strenuous activity during the hottest part of the day.'],
    Earthquake: ['Drop, cover, and hold on during shaking.', 'After shaking stops, move away from damaged buildings, glass, and utility lines.', 'Expect aftershocks and follow official instructions before re-entering buildings.'],
  }[hazardDemoData.type] ?? ['Move away from the hazard zone and follow official instructions.', 'Use an approved safe area and avoid blocked or restricted routes.', 'Keep communication devices charged and stay with vulnerable people.'];
  const localityDangerActive = hazardDemoData.status === 'ACTIVE' && ['CRITICAL', 'HIGH'].includes(hazardDemoData.severity);
  const emergencyVisualActive = localityDangerActive || noEscapeDemo;

  function stopSiren() {
    if (sirenIntervalRef.current) {
      window.clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    audioContextRef.current?.close();
    audioContextRef.current = null;
    setSirenEnabled(false);
  }

  function startSiren() {
    if (sirenEnabled) {
      stopSiren();
      return;
    }

    if (audioContextRef.current) {
      audioContextRef.current.resume().catch(() => {});
      setSirenEnabled(true);
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.value = 0.045;
    gain.connect(context.destination);
    let highTone = false;
    const playTone = () => {
      const oscillator = context.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = highTone ? 920 : 560;
      oscillator.connect(gain);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.42);
      highTone = !highTone;
    };
    playTone();
    sirenIntervalRef.current = window.setInterval(playTone, 460);
    audioContextRef.current = context;
    setSirenEnabled(true);
  }

  useEffect(() => () => stopSiren(), []);

  useEffect(() => {
    if (emergencyVisualActive) {
      startSiren();
    } else {
      stopSiren();
    }
  }, [emergencyVisualActive]);

  function handleEmergencyRequest() {
    const request = createEmergencyAssistanceRequest({
      hazardId: hazardDemoData.id,
      hazard: hazardDemoData.name,
      location: hazardDemoData.userLocation.label,
      reason: emergencyReason,
    });
    setAssistanceId(request.id);
    setEmergencyNotified(true);
    navigate('/hazard-demo/report', { state: { assistanceId: request.id } });
  }

  return (
    <div className={`hazard-demo-page${emergencyVisualActive ? ' hazard-demo-page--emergency' : ''}`}>
      <header className="hazard-demo-header">
        <Link className="hazard-demo-header__brand" to="/">
          <img alt="" aria-hidden="true" className="navbar__mark" src="/safesetu-crest.png" />
          <span><strong>SAHAS</strong></span>
        </Link>
        <div className="hazard-demo-header__actions">
          <span className="hazard-demo-header__tag">DEMO SCENARIO • ILLUSTRATIVE DATA</span>
          <Link className="hazard-demo-header__back" to="/">
            <ArrowLeft size={15} />
            Safety Map
          </Link>
        </div>
      </header>

      {emergencyVisualActive && <section className="hazard-demo-emergency-banner" aria-live="assertive"><Siren size={22} /><div><strong>{noEscapeDemo ? 'EMERGENCY: NO SAFE ESCAPE ROUTE' : `DANGER ALERT: ${hazardDemoData.name.toUpperCase()}`}</strong><span>{noEscapeDemo ? 'Move away from danger if possible. Officials are being alerted.' : 'People in this locality are facing an active hazard. Follow official evacuation and safety instructions.'}</span></div><div className="hazard-demo-emergency-banner__actions"><button onClick={startSiren} type="button">{sirenEnabled ? <><VolumeX size={15} /> Mute siren</> : <><Volume2 size={15} /> Play siren</>}</button><button onClick={() => setShowSafetyManual(true)} type="button"><BookOpen size={15} /> Safety manual</button></div></section>}

      <main className="hazard-demo-main">
        <section className={`hazard-demo-timer${isExpired ? ' hazard-demo-timer--expired' : ''}`} aria-live="polite">
          <div className="hazard-demo-timer__label">{isExpired ? 'EVACUATION ORDER ISSUED' : 'EVACUATION BUFFER'}</div>
          <div className="hazard-demo-timer__content">
            <strong className="hazard-demo-timer__value">{isExpired ? 'NOW' : formatCountdown(remainingMs)}</strong>
            <div className="hazard-demo-timer__details">
              <span>{isExpired ? 'IMMEDIATE ACTION' : `${hazardDemoData.type.toUpperCase()} ALERT`}</span>
              <small>
                {isExpired
                  ? 'Residents in the affected zone should move to the nearest safe area immediately.'
                  : `${hazardDemoData.name} · ${hazardDemoData.recommendedAction}`}
              </small>
            </div>
          </div>
        </section>

        <section className={`hazard-demo-no-escape${noEscapeDemo ? ' hazard-demo-no-escape--active' : ''}`}>
          <div><FileWarning size={18} /><span><strong>No escape routes demo</strong><small>Simulate a situation where every available route is unsafe.</small></span></div>
          <button onClick={() => { const nextValue = !noEscapeDemo; setNoEscapeDemo(nextValue); setEmergencyNotified(false); setAssistanceId(null); if (nextValue && !sirenEnabled) startSiren(); if (!nextValue) stopSiren(); }} type="button">{noEscapeDemo ? 'Restore route scenario' : 'Start demo'}</button>
        </section>

        <section className="hazard-demo-grid">
          <div className="hazard-demo-map-panel">
            <div className="hazard-demo-map-panel__header">
              <div>
                <p className="eyebrow">Hazard map</p>
                <h2>Active Scenario Overview</h2>
              </div>
              <span className="hazard-demo-map-panel__chip">⚠ ACTIVE</span>
              {selectedArea && (
                <button
                  aria-label={`Open navigation to ${selectedArea.name}`}
                  className="hazard-demo-map-panel__navigate"
                  onClick={handleNavigation}
                  type="button"
                >
                  <Navigation size={16} />
                  Open navigation
                </button>
              )}
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

                <HazardRipple center={hazardDemoData.hazardCenter} color="#d9485f" radius={hazardDemoData.hazardRadius} />

                <Marker icon={hazardMarkerIcon} position={hazardDemoData.hazardCenter}>
                  <Popup>
                    <strong>{hazardDemoData.type}</strong>
                    <br />
                    {hazardDemoData.name}
                  </Popup>
                </Marker>

                <UserLocationMarker label={hazardDemoData.userLocation.label} position={hazardDemoData.userLocation.position} />

                <SafeAreaDots areas={displayedRelocationAreas} onSelect={setSelectedAreaId} />

                {selectedArea && (
                  <RoadRoute color={noEscapeDemo ? '#d9485f' : '#159a62'} end={selectedArea.position} start={hazardDemoData.userLocation.position} />
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

              <button
                aria-describedby="emergency-assistance-status"
                className={`hazard-demo-emergency-action${assistanceConfirmed ? ' hazard-demo-emergency-action--notified' : ''}`}
                disabled={!emergencyAvailable || assistanceConfirmed}
                onClick={handleEmergencyRequest}
                type="button"
              >
                <Siren size={20} />
                <span>
                  <strong>{assistanceConfirmed ? 'Officials have been notified' : 'Emergency assistance'}</strong>
                  <small aria-live="polite" id="emergency-assistance-status">
                    {assistanceConfirmed
                      ? 'Your emergency request was sent to the Government Control Room.'
                      : emergencyAvailable
                        ? emergencyReason
                        : 'Available when no safe escape route remains.'}
                  </small>
                </span>
              </button>
              {assistanceConfirmed && <button className="hazard-demo-report-action" onClick={() => navigate('/hazard-demo/report', { state: { assistanceId } })} type="button">Demonstrate your situation</button>}
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
            {displayedRelocationAreas.map((area) => {
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
              <button aria-label={`Open navigation to ${selectedArea.name}`} onClick={handleNavigation} type="button">
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

      {showSafetyManual && <div className="hazard-demo-manual-backdrop" onClick={() => setShowSafetyManual(false)}><section aria-labelledby="safety-manual-title" className="hazard-demo-manual" onClick={(event) => event.stopPropagation()}><button aria-label="Close safety instructions manual" className="hazard-demo-manual__close" onClick={() => setShowSafetyManual(false)} type="button">×</button><p className="eyebrow">SAFETY INSTRUCTIONS MANUAL</p><h2 id="safety-manual-title">{hazardDemoData.type} · {hazardDemoData.name}</h2><p className="hazard-demo-manual__summary">Severity: <strong>{hazardDemoData.severity}</strong> · Recommended action: <strong>{hazardDemoData.recommendedAction}</strong></p><h3>What to do now</h3><ul>{hazardInstructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul><h3>Response checklist</h3><div className="hazard-demo-manual__checklist">{hazardDemoPrecautions.map((group) => <div key={group.title}><strong>{group.title}</strong><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}</div></section></div>}
    </div>
  );
}

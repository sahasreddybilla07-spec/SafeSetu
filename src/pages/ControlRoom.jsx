import HazardRipple from '../map/HazardRipple';
import SafeAreaDots from '../map/SafeAreaDots';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Gauge,
  LogOut,
  MapPinned,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import L from 'leaflet';
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import {
  applyLocationDecision,
  getGovernmentAuditTrail,
  getHazardDemoData,
  getHazardDemoSummary,
  saveHazardDemoData,
} from '../data/hazardDemo';

const hazardMarkerIcon = L.divIcon({
  className: 'control-room-marker-wrapper',
  html: '<div class="control-room-marker">⚠</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const navItems = ['Overview', 'Safe Areas', 'Alerts', 'Incident History'];

const sectionMap = {
  Overview: 'overview',
  'Safe Areas': 'safe-areas',
  Alerts: 'alerts',
  'Incident History': 'incident-history',
};

function formatApprovalStatus(status) {
  if (status === 'APPROVED') return 'approved';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
}

export default function ControlRoom() {
  const navigate = useNavigate();
  const { hazardId: routeHazardId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSection, setSelectedSection] = useState('Overview');
  const [reviewItemId, setReviewItemId] = useState(null);
  const [notice, setNotice] = useState('');
  const [expandedApproved, setExpandedApproved] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    const auth = localStorage.getItem('safesetu-gov-auth');
    if (auth !== 'true') {
      navigate('/government/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!routeHazardId) {
      return;
    }

    const data = getHazardDemoData();
    const hazardExists = data.hazards.some((hazard) => hazard.id === routeHazardId);

    if (!hazardExists || data.activeHazardId === routeHazardId) {
      return;
    }

    saveHazardDemoData({ activeHazardId: routeHazardId, hazards: data.hazards });
    setRefreshKey((value) => value + 1);
  }, [routeHazardId]);

  useEffect(() => {
    const handleStateUpdate = () => {
      setRefreshKey((value) => value + 1);
    };

    window.addEventListener('safesetu-hazard-demo-updated', handleStateUpdate);
    window.addEventListener('storage', handleStateUpdate);

    return () => {
      window.removeEventListener('safesetu-hazard-demo-updated', handleStateUpdate);
      window.removeEventListener('storage', handleStateUpdate);
    };
  }, []);

  const demoData = useMemo(() => getHazardDemoData(), [refreshKey]);
  const activeHazard = useMemo(
    () => demoData.hazards.find((hazard) => hazard.id === demoData.activeHazardId) ?? demoData.hazards[0] ?? null,
    [demoData],
  );
  const summary = useMemo(() => getHazardDemoSummary(), [refreshKey]);
  const auditTrail = useMemo(() => getGovernmentAuditTrail(), [refreshKey]);

  const pendingLocations = activeHazard ? activeHazard.relocationAreas.filter((area) => area.approvalStatus === 'PENDING') : [];
  const approvedLocations = activeHazard ? activeHazard.relocationAreas.filter((area) => area.approvalStatus === 'APPROVED') : [];
  const rejectedLocations = activeHazard ? activeHazard.relocationAreas.filter((area) => area.approvalStatus === 'REJECTED') : [];
  const primaryApprovedLocation = approvedLocations[0] ?? null;
  const secondaryApprovedLocations = approvedLocations.slice(1);

  useEffect(() => {
    if (!activeHazard) {
      return;
    }

    setReviewItemId((currentReviewItemId) => {
      if (!currentReviewItemId) {
        return currentReviewItemId;
      }

      const currentExists = activeHazard.relocationAreas.some((area) => area.id === currentReviewItemId);
      return currentExists ? currentReviewItemId : null;
    });
  }, [activeHazard, pendingLocations, rejectedLocations]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice('');
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const highlightedReviewItem = reviewItemId
    ? activeHazard?.relocationAreas.find((area) => area.id === reviewItemId) ?? null
    : null;

  function handleDecision(locationId, decision) {
    const currentArea = activeHazard?.relocationAreas.find((area) => area.id === locationId);
    applyLocationDecision(locationId, decision, 'Control Room Admin');
    setReviewItemId(null);

    if (decision === 'APPROVED') {
      const approvedMessage =
        currentArea?.approvalStatus === 'REJECTED'
          ? 'Rejected site reconsidered and restored to active recommendations.'
          : 'Location approved successfully.';
      setNotice(approvedMessage);
    } else if (decision === 'PENDING') {
      setNotice('Location moved back to pending review. You can decide later from the review queue.');
    } else {
      setNotice('Location rejected and removed from active recommendations.');
    }

    setRefreshKey((value) => value + 1);
  }

  function handleHazardChange(hazardId) {
    const nextState = {
      activeHazardId: hazardId,
      hazards: demoData.hazards,
    };

    saveHazardDemoData(nextState);
    setRefreshKey((value) => value + 1);
    setSelectedSection('Overview');
    setExpandedApproved(false);
  }

  function handleLogout() {
    localStorage.removeItem('safesetu-gov-auth');
    localStorage.removeItem('safesetu-gov-official');
    navigate('/government/login', { replace: true });
  }

  function handleNavClick(item) {
    setSelectedSection(item);
    const sectionId = sectionMap[item];
    const target = sectionId ? sectionRefs.current[sectionId] : null;

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleViewOnMap(locationId) {
    navigate(`/government/control-room/map/${encodeURIComponent(locationId)}`);
  }

  if (!activeHazard) {
    return null;
  }

  return (
    <div className="control-room-shell">
      <aside className="control-room-sidebar" aria-label="Government controls sidebar">
        <div className="control-room-sidebar__brand">
          <img alt="" aria-hidden="true" className="navbar__mark" src="/safesetu-crest.png" />
          <div>
            <strong>SAHAS</strong>
            <small>CONTROL ROOM</small>
          </div>
        </div>

        <nav className="control-room-nav" aria-label="Government control room sections">
          {navItems.map((item) => (
            <button
              className={`control-room-nav__item${selectedSection === item ? ' is-active' : ''}`}
              key={item}
              onClick={() => handleNavClick(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <button className="control-room-sidebar__public" onClick={() => navigate('/government/control-room')} type="button">
          All active hazards
        </button>

        <button className="control-room-sidebar__public" onClick={() => navigate('/')} type="button">
          Back to public platform
        </button>

        <div className="control-room-sidebar__profile">
          <div className="control-room-sidebar__avatar">CO</div>
          <div>
            <strong>Government Official</strong>
            <span>Control Room Administrator</span>
          </div>
        </div>

        <button className="control-room-sidebar__logout" onClick={handleLogout} type="button">
          <LogOut size={15} />
          Logout
        </button>
      </aside>

      <main className="control-room-main">
        <header className="control-room-header">
          <div>
            <p className="control-room-eyebrow">SAHAS</p>
            <h1>NATIONAL DISASTER CONTROL ROOM</h1>
          </div>
          <div className="control-room-header__status">
            <span className="status-indicator">●</span>
            <span className="status-label">SYSTEM OPERATIONAL</span>
            <span className="status-meta">DEMO MODE • ILLUSTRATIVE DATA</span>
          </div>
        </header>

        <section className="control-room-summary" aria-label="Operational overview metrics">
          <article className="control-room-stat">
            <div className="control-room-stat__label">Active Hazards</div>
            <strong>{summary.activeHazards}</strong>
            <span><AlertTriangle size={13} /> Live risk monitor</span>
          </article>
          <article className="control-room-stat">
            <div className="control-room-stat__label">People at Risk</div>
            <strong>{summary.peopleAtRisk.toLocaleString('en-IN')}</strong>
            <span><Users size={13} /> Population tracking</span>
          </article>
          <article className="control-room-stat control-room-stat--warning">
            <div className="control-room-stat__label">Sites Awaiting Review</div>
            <strong>{pendingLocations.length}</strong>
            <span><ShieldCheck size={13} /> Human verification required</span>
          </article>
          <article className="control-room-stat control-room-stat--success">
            <div className="control-room-stat__label">Approved Safe Areas</div>
            <strong>{approvedLocations.length}</strong>
            <span><Check size={13} /> Publicly available</span>
          </article>
          <article className="control-room-stat control-room-stat--alert">
            <div className="control-room-stat__label">Pending Actions</div>
            <strong>{summary.pendingActions}</strong>
            <span><Clock3 size={13} /> Decision queue</span>
          </article>
        </section>

        <section className="control-room-section control-room-section--compact">
          <div className="section-heading section-heading--split">
            <div>
              <p>HAZARD SELECTOR</p>
              <h3>Choose the active hazard to review</h3>
            </div>
          </div>

          <div className="hazard-selector" aria-label="Hazard selector">
            {demoData.hazards.map((hazard) => (
              <button
                key={hazard.id}
                className={`hazard-selector__chip${hazard.id === activeHazard.id ? ' is-active' : ''}`}
                onClick={() => handleHazardChange(hazard.id)}
                type="button"
              >
                <span>{hazard.type}</span>
                <strong>{hazard.name}</strong>
              </button>
            ))}
          </div>
        </section>

        {(selectedSection === 'Overview' || selectedSection === 'Safe Areas') && (
          <div className="control-room-lower-grid">
            <section className="control-room-section" ref={(node) => { sectionRefs.current['safe-areas'] = node; }}>
              <div className="section-heading section-heading--split">
                <div>
                  <p>APPROVED SAFE AREAS</p>
                  <h3>Government-approved relocation destinations</h3>
                </div>
              </div>

              <div className="approved-list">
                {primaryApprovedLocation ? (
                  <>
                    <article className="approved-card" key={primaryApprovedLocation.id}>
                      <div className="approved-card__status">✓ GOVERNMENT APPROVED</div>
                      <h4>{primaryApprovedLocation.name}</h4>
                      <div className="approved-card__meta">
                        <span>
                          Approved: {new Date(primaryApprovedLocation.approvedAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(primaryApprovedLocation.approvedAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })} IST
                        </span>
                        <span>Approved By: {primaryApprovedLocation.approvedBy || 'Control Room Admin'}</span>
                      </div>
                      <div className="approved-card__stats">
                        <div><span>Capacity</span><strong>{primaryApprovedLocation.capacity}</strong></div>
                        <div><span>Occupancy</span><strong>{primaryApprovedLocation.occupancy}%</strong></div>
                        <div><span>Available</span><strong>{primaryApprovedLocation.available}</strong></div>
                        <div><span>Route Safety</span><strong>{primaryApprovedLocation.safetyScore}%</strong></div>
                      </div>
                      <div className="approved-card__status-row">
                        <span>Status: ACTIVE FOR EVACUATION</span>
                      </div>
                      <div className="approved-card__actions">
                        <button
                          className="control-room-secondary-button"
                          onClick={() => handleViewOnMap(primaryApprovedLocation.id)}
                          type="button"
                        >
                          VIEW ON MAP
                        </button>
                        <button
                          className="approved-card__later"
                          onClick={() => handleDecision(primaryApprovedLocation.id, 'PENDING')}
                          type="button"
                        >
                          REVIEW LATER
                        </button>
                        <button
                          className="approved-card__remove"
                          onClick={() => handleDecision(primaryApprovedLocation.id, 'REJECTED')}
                          type="button"
                        >
                          REMOVE FROM ACTIVE
                        </button>
                      </div>
                    </article>

                    {secondaryApprovedLocations.length > 0 && (
                      <button className="approved-card__toggle" onClick={() => setExpandedApproved((value) => !value)} type="button">
                        {expandedApproved ? 'Hide more approved sites' : `Show ${secondaryApprovedLocations.length} more approved site${secondaryApprovedLocations.length > 1 ? 's' : ''}`}
                      </button>
                    )}

                    {expandedApproved && (
                      <div className="approved-list approved-list--expanded">
                        {secondaryApprovedLocations.map((location) => (
                          <article className="approved-card approved-card--secondary" key={location.id}>
                            <div className="approved-card__status">✓ GOVERNMENT APPROVED</div>
                            <h4>{location.name}</h4>
                            <div className="approved-card__meta">
                              <span>
                                Approved: {new Date(location.approvedAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(location.approvedAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })} IST
                              </span>
                              <span>Approved By: {location.approvedBy || 'Control Room Admin'}</span>
                            </div>
                            <div className="approved-card__stats">
                              <div><span>Capacity</span><strong>{location.capacity}</strong></div>
                              <div><span>Occupancy</span><strong>{location.occupancy}%</strong></div>
                              <div><span>Available</span><strong>{location.available}</strong></div>
                              <div><span>Route Safety</span><strong>{location.safetyScore}%</strong></div>
                            </div>
                            <div className="approved-card__status-row">
                              <span>Status: ACTIVE FOR EVACUATION</span>
                            </div>
                            <div className="approved-card__actions">
                              <button
                                className="control-room-secondary-button"
                                onClick={() => handleViewOnMap(location.id)}
                                type="button"
                              >
                                VIEW ON MAP
                              </button>
                              <button
                                className="approved-card__later"
                                onClick={() => handleDecision(location.id, 'PENDING')}
                                type="button"
                              >
                                REVIEW LATER
                              </button>
                              <button
                                className="approved-card__remove"
                                onClick={() => handleDecision(location.id, 'REJECTED')}
                                type="button"
                              >
                                REMOVE FROM ACTIVE
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state">No approved safe areas are available yet.</div>
                )}
              </div>
            </section>

            <section className="control-room-section control-room-section--compact">
              <div className="section-heading section-heading--compact">
                <div>
                  <p>PENDING REVIEW</p>
                  <h3>Sites to be accepted or rejected</h3>
                </div>
                <span className="section-heading__note">{pendingLocations.length} locations awaiting review</span>
              </div>

              <div className="candidate-list">
                {pendingLocations.length === 0 ? (
                  <div className="empty-state">No locations are currently awaiting review.</div>
                ) : (
                  pendingLocations.map((candidate) => (
                    <article className="candidate-card" key={candidate.id}>
                      <div className="candidate-card__top">
                        <div>
                          <span className="candidate-card__heading">{candidate.name}</span>
                          <p>Distance from affected zone: {candidate.distanceKm} km</p>
                        </div>
                        <button className="candidate-card__review" onClick={() => setReviewItemId(candidate.id)} type="button">
                          REVIEW
                        </button>
                      </div>

                      <div className="candidate-card__metrics">
                        <div>
                          <span>Route Safety</span>
                          <strong>{candidate.safetyScore}%</strong>
                        </div>
                        <div>
                          <span>Capacity</span>
                          <strong>{candidate.capacity}</strong>
                        </div>
                        <div>
                          <span>Current Occupancy</span>
                          <strong>{candidate.occupancy}%</strong>
                        </div>
                        <div>
                          <span>Available</span>
                          <strong>{candidate.available}</strong>
                        </div>
                        <div>
                          <span>Estimated Travel Time</span>
                          <strong>{candidate.travelTime}</strong>
                        </div>
                        <div>
                          <span>Risk</span>
                          <strong className={`severity-badge severity-badge--${candidate.riskLevel === 'LOW' ? 'safe' : 'warning'}`}>
                            {candidate.riskLevel}
                          </strong>
                        </div>
                      </div>

                      <div className="candidate-card__footer">
                        <div>
                          <span>Recommendation</span>
                          <strong>{candidate.aiRecommendation}</strong>
                        </div>
                        <div>
                          <span>Status</span>
                          <strong className="status-pill status-pill--pending">● PENDING REVIEW</strong>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="control-room-section control-room-section--compact">
              <div className="section-heading section-heading--compact">
                <div>
                  <p>REJECTED SITES</p>
                  <h3>Emergency re-check queue</h3>
                </div>
              </div>

              <div className="rejected-list">
                {rejectedLocations.length === 0 ? (
                  <div className="empty-state">No rejected sites currently waiting for reconsideration.</div>
                ) : (
                  rejectedLocations.map((location) => (
                    <article className="rejected-card" key={location.id}>
                      <div className="rejected-card__status">⚠ REJECTED</div>
                      <h4>{location.name}</h4>
                      <div className="rejected-card__meta">
                        <span>Distance: {location.distanceKm} km</span>
                        <span>Reason: {location.reviewNote || 'Manual review did not approve this site.'}</span>
                      </div>
                      <div className="rejected-card__stats">
                        <div><span>Capacity</span><strong>{location.capacity}</strong></div>
                        <div><span>Occupancy</span><strong>{location.occupancy}%</strong></div>
                        <div><span>Available</span><strong>{location.available}</strong></div>
                        <div><span>Safety</span><strong>{location.safetyScore}%</strong></div>
                      </div>
                      <div className="rejected-card__actions">
                        <button className="rejected-card__review" onClick={() => setReviewItemId(location.id)} type="button">CHECK SITE</button>
                        <button className="rejected-card__approve" onClick={() => handleDecision(location.id, 'APPROVED')} type="button">RESTORE TO ACTIVE</button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {(selectedSection === 'Overview' || selectedSection === 'Alerts') && (
          <section className="control-room-section control-room-section--compact" ref={(node) => { sectionRefs.current['alerts'] = node; }}>
            <div className="section-heading section-heading--compact">
              <div>
                <p>ALERTS</p>
                <h3>Operational notifications</h3>
              </div>
            </div>
            <div className="alert-list">
              {activeHazard.alerts.map((alert) => (
                <div className={`alert-item alert-item--${alert.severity.toLowerCase()}`} key={alert.id}>
                  <div className="alert-item__head">
                    <span className="alert-item__severity">{alert.severity}</span>
                    <small>{alert.time}</small>
                  </div>
                  <strong>{alert.title}</strong>
                  <span>{alert.location}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(selectedSection === 'Overview' || selectedSection === 'Incident History') && (
          <section className="control-room-section control-room-section--compact" ref={(node) => { sectionRefs.current['incident-history'] = node; }}>
            <div className="section-heading section-heading--compact">
              <div>
                <p>DECISION AUDIT TRAIL</p>
                <h3>Recent government actions</h3>
              </div>
            </div>
            <div className="audit-list">
              {auditTrail.map((entry, index) => (
                <div className="audit-item" key={`${entry.time}-${index}`}>
                  <time>{entry.time}</time>
                  <div>
                    <strong>{entry.text}</strong>
                    <span>{entry.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(selectedSection === 'Overview' || selectedSection === 'Active Hazards') && (
          <section className="control-room-hero" ref={(node) => { sectionRefs.current['overview'] = node; }}>
            <div className="control-room-hero__panel">
              <div className="control-room-hero__heading">
                <p>ACTIVE HAZARD</p>
                <h2>{activeHazard.name}</h2>
              </div>
              <div className="control-room-hero__stats">
                <div>
                  <span>People at Risk</span>
                  <strong>{activeHazard.peopleAtRisk.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span>Affected Region</span>
                  <strong>{activeHazard.affectedRegion}</strong>
                </div>
                <div>
                  <span>Risk Level</span>
                  <strong className="severity-badge severity-badge--critical">{activeHazard.severity}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{activeHazard.status}</strong>
                </div>
              </div>
              <div className="control-room-hero__details">
                <span><Clock3 size={13} /> Detected: {activeHazard.lastUpdated}</span>
              </div>
            </div>

            <div className="control-room-map-panel">
              <div className="control-room-map-panel__header">
                <div>
                  <p>MAP / SITUATIONAL AWARENESS</p>
                  <h3>Operational view</h3>
                </div>
                <span className="map-tag">ACTIVE</span>
              </div>
              <div className="control-room-map-frame">
                <MapContainer className="control-room-map" center={activeHazard.hazardCenter} scrollWheelZoom zoom={6.5}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Circle
                    center={activeHazard.hazardCenter}
                    pathOptions={{ color: '#d9485f', fillColor: '#d9485f', fillOpacity: 0.22, weight: 2 }}
                    radius={activeHazard.hazardRadius}
                  />
                  <HazardRipple center={activeHazard.hazardCenter} color="#d9485f" radius={activeHazard.hazardRadius} />

                  <Marker icon={hazardMarkerIcon} position={activeHazard.hazardCenter}>
                    <Popup>
                      <strong>{activeHazard.type}</strong>
                      <br />
                      {activeHazard.name}
                    </Popup>
                  </Marker>

                  {activeHazard.relocationAreas.map((area) => {
                    const color =
                      area.approvalStatus === 'APPROVED'
                        ? '#2fbf71'
                        : area.approvalStatus === 'REJECTED'
                          ? '#4a5568'
                          : '#f1b75c';

                    return (
                      <CircleMarker
                        center={area.position}
                        key={area.id}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
                        radius={area.approvalStatus === 'APPROVED' ? 10 : 8}
                      >
                        <Popup>
                          <strong>{area.name}</strong>
                          <br />
                          {area.approvalStatus}
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                                  <SafeAreaDots areas={activeHazard.relocationAreas.filter((area) => area.approvalStatus === 'APPROVED')} />
                </MapContainer>

                <div className="control-room-map__legend">
                  <span><i className="legend-dot legend-dot--critical" />Critical Hazard</span>
                  <span><i className="legend-dot legend-dot--warning" />Moderate Hazard</span>
                  <span><i className="legend-dot legend-dot--approved" />Approved Safe Area</span>
                  <span><i className="legend-dot legend-dot--pending" />Pending Review</span>
                  <span><i className="legend-dot legend-dot--rejected" />Rejected</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {highlightedReviewItem && (
          <div className="review-modal-backdrop" aria-modal="true" role="dialog">
            <div className="review-modal">
              <button className="review-modal__close" onClick={() => setReviewItemId(null)} type="button" aria-label="Close review panel">
                <X size={16} />
              </button>
              <div className="review-modal__header">
                <p>LOCATION REVIEW</p>
                <button className="review-modal__dismiss" onClick={() => setReviewItemId(null)} type="button">
                  Close popup
                </button>
              </div>
              <h2>{highlightedReviewItem.name}</h2>

              <div className="review-grid review-grid--two">
                <div>
                  <span>Latitude</span>
                  <strong>{highlightedReviewItem.latitude}</strong>
                </div>
                <div>
                  <span>Longitude</span>
                  <strong>{highlightedReviewItem.longitude}</strong>
                </div>
              </div>

              <div className="review-details-block">
                <h3>Location Details</h3>
                <div className="review-grid review-grid--two">
                  <div>
                    <span>Address</span>
                    <strong>{highlightedReviewItem.address}</strong>
                  </div>
                  <div>
                    <span>Distance from hazard</span>
                    <strong>{highlightedReviewItem.distanceKm} km</strong>
                  </div>
                  <div>
                    <span>Distance from affected population</span>
                    <strong>{highlightedReviewItem.distanceFromPopulation}</strong>
                  </div>
                  <div>
                    <span>Current occupancy</span>
                    <strong>{highlightedReviewItem.occupancy}%</strong>
                  </div>
                </div>
              </div>

              <div className="review-details-block">
                <h3>Capacity</h3>
                <div className="review-capacity">
                  <div className="review-capacity__head">
                    <span>Total Capacity</span>
                    <strong>{highlightedReviewItem.capacity}</strong>
                  </div>
                  <div className="review-capacity__usage">
                    <span>Current Occupancy</span>
                    <strong>{highlightedReviewItem.occupancy}%</strong>
                  </div>
                  <div className="review-capacity__bar">
                    <span style={{ width: `${highlightedReviewItem.occupancy}%` }} />
                  </div>
                  <div className="review-capacity__meta">
                    <span>Available</span>
                    <strong>{highlightedReviewItem.available}</strong>
                  </div>
                </div>
              </div>

              <div className="review-details-block">
                <h3>Route Analysis</h3>
                <div className="review-grid review-grid--three">
                  <div>
                    <span>Recommended Route</span>
                    <strong>{highlightedReviewItem.safetyScore}% Safety Score</strong>
                  </div>
                  <div>
                    <span>Estimated Travel</span>
                    <strong>{highlightedReviewItem.travelTime}</strong>
                  </div>
                  <div>
                    <span>Road Status</span>
                    <strong>{highlightedReviewItem.roadStatus}</strong>
                  </div>
                  <div>
                    <span>Flood Risk</span>
                    <strong>{highlightedReviewItem.floodRisk}</strong>
                  </div>
                  <div>
                    <span>Landslide Risk</span>
                    <strong>{highlightedReviewItem.landslideRisk}</strong>
                  </div>
                  <div>
                    <span>Traffic</span>
                    <strong>{highlightedReviewItem.traffic}</strong>
                  </div>
                </div>
                <div className="route-recommendation">
                  <span>Route Recommendation</span>
                  <strong>RECOMMENDED</strong>
                </div>
              </div>

              <div className="review-details-block review-details-block--system">
                <h3>Recommendation Summary</h3>
                <p>{highlightedReviewItem.recommendationSummary}</p>
              </div>

              <div className="review-decision">
                <h3>Government Decision</h3>
                <div className="review-decision__buttons">
                  <button className="review-decision__approve" onClick={() => handleDecision(highlightedReviewItem.id, 'APPROVED')} type="button">
                    <Check size={15} />
                    {highlightedReviewItem.approvalStatus === 'REJECTED' ? 'RE-APPROVE LOCATION' : 'APPROVE LOCATION'}
                  </button>
                  <button className="review-decision__reject" onClick={() => handleDecision(highlightedReviewItem.id, 'REJECTED')} type="button">
                    <X size={15} />
                    REJECT LOCATION
                  </button>
                </div>
                <button className="review-decision__later" onClick={() => handleDecision(highlightedReviewItem.id, 'PENDING')} type="button">
                  REVIEW LATER
                </button>
                <div className="review-modal__footer">
                  <button className="review-modal__dismiss review-modal__dismiss--footer" onClick={() => setReviewItemId(null)} type="button">
                    Close popup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {notice && (
          <div className="control-room-toast">
            <button className="control-room-toast__close" onClick={() => setNotice('')} type="button" aria-label="Close notification">
              <X size={14} />
            </button>
            {notice}
          </div>
        )}
      </main>
    </div>
  );
}

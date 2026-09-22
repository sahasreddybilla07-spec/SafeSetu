import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Check,
  ClipboardList,
  Droplet,
  HeartPulse,
  MapPinned,
  Navigation,
  Package,
  Plus,
  Radio,
  ShieldAlert,
  Truck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { applyFieldOfficerUpdate, deactivateRelocationCentre, getHazardDemoData } from '../data/hazardDemo';
import {
  RESOURCE_DEFINITIONS,
  addResourceStock,
  getCentreStatusSummary,
  recordIncoming,
  recordTransferOut,
  requestFoodSupply,
  requestMedicalSupport,
  requestWaterSupply,
} from '../data/centreOperations';
import { emojiFor, levelFor } from '../utils/statusLevels';

const safeAreaMarkerIcon = L.divIcon({
  className: 'safe-area-map-marker-wrapper',
  html: '<div class="safe-area-map-marker">⌖</div>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -20],
});

const DEACTIVATION_REASONS = [
  'Capacity exhausted',
  'Unsafe conditions',
  'Flooding',
  'Medical emergency',
  'Resources depleted',
  'Disaster situation changed',
  'Other',
];

const ACTION_DEFS = {
  resource: { title: 'ADD RESOURCE', icon: Package },
  occupancy: { title: 'UPDATE OCCUPANCY', icon: Users },
  incoming: { title: 'REGISTER INCOMING PEOPLE', icon: UserPlus },
  transfer: { title: 'TRANSFER PEOPLE', icon: Truck },
  medical: { title: 'REQUEST MEDICAL SUPPORT', icon: HeartPulse },
  food: { title: 'REQUEST FOOD SUPPLY', icon: ClipboardList },
  water: { title: 'REQUEST WATER SUPPLY', icon: Droplet },
};

function statusLabel(status) {
  return status === 'APPROVED' ? 'Government approved' : status === 'REJECTED' ? 'Rejected' : 'Pending review';
}

export default function ControlRoomLocationMap() {
  const navigate = useNavigate();
  const { locationId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState('');
  const [actionType, setActionType] = useState(null);
  const [actionForm, setActionForm] = useState(null);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState(DEACTIVATION_REASONS[0]);
  const [deactivateOtherReason, setDeactivateOtherReason] = useState('');

  useEffect(() => {
    if (localStorage.getItem('safesetu-gov-auth') !== 'true') {
      navigate('/government/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleStateUpdate = () => setRefreshKey((value) => value + 1);
    window.addEventListener('safesetu-hazard-demo-updated', handleStateUpdate);
    window.addEventListener('safesetu-centre-ops-updated', handleStateUpdate);
    window.addEventListener('storage', handleStateUpdate);
    return () => {
      window.removeEventListener('safesetu-hazard-demo-updated', handleStateUpdate);
      window.removeEventListener('safesetu-centre-ops-updated', handleStateUpdate);
      window.removeEventListener('storage', handleStateUpdate);
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const { hazard, safeArea } = useMemo(() => {
    const data = getHazardDemoData();
    const matchingHazard = data.hazards.find((item) => item.relocationAreas.some((area) => area.id === locationId));

    return {
      hazard: matchingHazard ?? null,
      safeArea: matchingHazard?.relocationAreas.find((area) => area.id === locationId) ?? null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, refreshKey]);

  if (!safeArea || !hazard) {
    return (
      <main className="control-room-location-map control-room-location-map--empty">
        <p>LOCATION UNAVAILABLE</p>
        <h1>Safe area not found</h1>
        <button onClick={() => navigate('/government/control-room')} type="button">
          <ArrowLeft size={16} /> Back to Active Hazard Locations
        </button>
      </main>
    );
  }

  const population = safeArea.peoplePresent;
  const {
    operations,
    foodDailyRequirement,
    foodCoverageDays,
    foodStatus,
    waterDailyRequirement,
    waterCoverageDays,
    waterStatus,
    bedOccupancyPct,
    medicalStatus,
    resourceAlerts,
  } = getCentreStatusSummary(safeArea);

  const criticalCases = Math.max(0, Math.round(population * 0.015));
  const specialAssistance = Math.max(0, Math.round(population * 0.045));
  const elderly = Math.round(population * 0.15);
  const children = Math.round(population * 0.22);
  const adults = Math.max(0, population - criticalCases - specialAssistance - elderly - children);

  const isInactive = safeArea.operationalStatus === 'INACTIVE';
  const isPending = safeArea.approvalStatus === 'PENDING';
  const isRejected = safeArea.approvalStatus === 'REJECTED';
  const nearCapacity = safeArea.occupancy >= 85;

  const statusTone = isInactive ? 'inactive' : isRejected ? 'rejected' : isPending ? 'pending' : nearCapacity ? 'warning' : 'active';
  const statusLevel = isInactive || isRejected ? 'NEUTRAL' : isPending ? 'ATTENTION_REQUIRED' : nearCapacity ? 'HIGH' : 'STABLE';
  const statusText = isInactive
    ? 'INACTIVE'
    : isRejected
      ? 'REJECTED'
      : isPending
        ? 'PENDING APPROVAL'
        : nearCapacity
          ? 'NEARING CAPACITY'
          : 'ACTIVE FOR EVACUATION';

  const otherActiveCentres = hazard.relocationAreas.filter(
    (area) => area.id !== safeArea.id && area.approvalStatus === 'APPROVED' && area.operationalStatus === 'ACTIVE',
  );

  function openAction(type) {
    setActionType(type);
    if (type === 'occupancy') {
      setActionForm({ value: String(population) });
    } else if (type === 'transfer') {
      setActionForm({ value: '', destinationId: otherActiveCentres[0]?.id ?? '', destinationText: '' });
    } else if (type === 'medical') {
      setActionForm({ note: '' });
    } else if (type === 'resource') {
      setActionForm({ resourceKey: RESOURCE_DEFINITIONS[0].key, value: '' });
    } else {
      setActionForm({ value: '' });
    }
  }

  function closeAction() {
    setActionType(null);
    setActionForm(null);
  }

  function handleActionSubmit(event) {
    event.preventDefault();
    if (!actionType || !actionForm) return;

    if (actionType === 'occupancy') {
      const next = Math.max(0, Math.round(Number(actionForm.value) || 0));
      applyFieldOfficerUpdate(safeArea.id, { peoplePresent: next });
      setNotice(`Occupancy updated to ${next.toLocaleString('en-IN')}.`);
    } else if (actionType === 'incoming') {
      const count = Math.max(0, Math.round(Number(actionForm.value) || 0));
      if (count > 0) {
        applyFieldOfficerUpdate(safeArea.id, { peoplePresent: population + count });
        recordIncoming(safeArea.id, count);
      }
      setNotice(`${count.toLocaleString('en-IN')} incoming people registered.`);
    } else if (actionType === 'transfer') {
      const count = Math.max(0, Math.round(Number(actionForm.value) || 0));
      let destinationLabel = actionForm.destinationText || 'another facility';

      if (count > 0) {
        applyFieldOfficerUpdate(safeArea.id, { peoplePresent: Math.max(0, population - count) });
        recordTransferOut(safeArea.id, count);

        const destinationArea = otherActiveCentres.find((area) => area.id === actionForm.destinationId);
        if (destinationArea) {
          const nextDestinationPopulation = Math.min(
            destinationArea.capacity,
            (destinationArea.peoplePresent ?? 0) + count,
          );
          applyFieldOfficerUpdate(destinationArea.id, { peoplePresent: nextDestinationPopulation });
          recordIncoming(destinationArea.id, count);
          destinationLabel = destinationArea.name;
        }
      }

      setNotice(`${count.toLocaleString('en-IN')} people transferred to ${destinationLabel}.`);
    } else if (actionType === 'medical') {
      requestMedicalSupport(safeArea.id, actionForm.note || 'Medical support requested');
      setNotice('Medical support request sent.');
    } else if (actionType === 'food') {
      const qty = Math.max(0, Math.round(Number(actionForm.value) || 0));
      requestFoodSupply(safeArea.id, qty);
      setNotice(`Requested ${qty.toLocaleString('en-IN')} additional meals.`);
    } else if (actionType === 'water') {
      const qty = Math.max(0, Math.round(Number(actionForm.value) || 0));
      requestWaterSupply(safeArea.id, qty);
      setNotice(`Requested ${qty.toLocaleString('en-IN')} L additional water.`);
    } else if (actionType === 'resource') {
      const qty = Math.max(0, Math.round(Number(actionForm.value) || 0));
      addResourceStock(safeArea.id, actionForm.resourceKey, qty);
      const def = RESOURCE_DEFINITIONS.find((resource) => resource.key === actionForm.resourceKey);
      setNotice(`${qty.toLocaleString('en-IN')} ${def?.label ?? 'units'} added to stock.`);
    }

    closeAction();
    setRefreshKey((value) => value + 1);
  }

  function handleConfirmDeactivate(event) {
    event.preventDefault();
    const reason = deactivateReason === 'Other' ? (deactivateOtherReason.trim() || 'Other') : deactivateReason;
    deactivateRelocationCentre(safeArea.id, reason, 'Control Room Admin');
    setNotice(`${safeArea.name} removed from active operations.`);
    setShowDeactivate(false);
    setDeactivateReason(DEACTIVATION_REASONS[0]);
    setDeactivateOtherReason('');
    setRefreshKey((value) => value + 1);
  }

  return (
    <main className="cop-shell">
      <header className="cop-topbar">
        <button
          className="lcc-back"
          onClick={() => navigate(`/government/control-room/hazard/${encodeURIComponent(hazard.id)}`)}
          type="button"
        >
          <ArrowLeft size={16} /> Back to Command Centre
        </button>
        <span className="lcc-topbar__eyebrow">RELOCATION CENTRE OPERATIONS</span>
      </header>

      <section className="cop-header">
        <div>
          <p className="lcc-eyebrow">{hazard.name}</p>
          <h1>{safeArea.name.toUpperCase()}</h1>
          <span className="cop-address">{safeArea.address}</span>
        </div>
        <span className={`cop-status-pill cop-status-pill--${statusTone}`}>{emojiFor(statusLevel)} STATUS: {statusText}</span>
      </section>

      <section className="cop-summary" aria-label="Centre capacity summary">
        <div>
          <span>Capacity</span>
          <strong>{safeArea.capacity.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span>Current Population</span>
          <strong>{population.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span>Available</span>
          <strong>{safeArea.available.toLocaleString('en-IN')}</strong>
        </div>
        <div className={nearCapacity ? 'cop-summary__warning' : ''}>
          <span>Occupancy</span>
          <strong>{safeArea.occupancy}%</strong>
        </div>
      </section>
      <div className="cop-occupancy-bar">
        <span
          className={nearCapacity ? 'cop-occupancy-bar__fill cop-occupancy-bar__fill--warning' : 'cop-occupancy-bar__fill'}
          style={{ width: `${Math.min(100, safeArea.occupancy)}%` }}
        />
      </div>

      <div className="lcc-grid">
        <section className="lcc-panel cop-map-panel">
          <div className="lcc-panel__heading">
            <p>SITE</p>
            <h3><MapPinned size={15} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />Exact centre location</h3>
          </div>
          <div className="cop-map-frame">
            <MapContainer center={safeArea.position} className="cop-map" scrollWheelZoom zoom={13}>
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
        </section>

        <section className="lcc-panel">
          <div className="lcc-panel__heading">
            <p>SITE READINESS</p>
            <h3>Route & contact details</h3>
          </div>
          <div className="lcc-param-grid">
            <div className="lcc-param"><span>Route Safety</span><strong>{safeArea.safetyScore}%</strong></div>
            <div className="lcc-param"><span>Distance</span><strong>{safeArea.distanceKm} km</strong></div>
            <div className="lcc-param"><span>Travel Time</span><strong><Navigation size={13} style={{ verticalAlign: '-2px' }} /> {safeArea.travelTime}</strong></div>
            <div className="lcc-param"><span>Emergency Contact</span><strong>{safeArea.emergencyContact}</strong></div>
          </div>
        </section>
      </div>

      <section className="lcc-panel cop-section">
        <div className="lcc-panel__heading">
          <p>SECTION 1 · PEOPLE</p>
          <h3>Population profile</h3>
        </div>
        <div className="cop-total-people">
          <span>TOTAL PEOPLE</span>
          <strong>{population.toLocaleString('en-IN')}</strong>
        </div>
        <div className="cop-people-grid">
          <div><span>Adults</span><strong>{adults.toLocaleString('en-IN')}</strong></div>
          <div><span>Children</span><strong>{children.toLocaleString('en-IN')}</strong></div>
          <div><span>Elderly</span><strong>{elderly.toLocaleString('en-IN')}</strong></div>
          <div><span>Special Assistance</span><strong>{specialAssistance.toLocaleString('en-IN')}</strong></div>
          <div className="cop-people-grid__critical"><span>Critical Cases</span><strong>{criticalCases.toLocaleString('en-IN')}</strong></div>
        </div>
        <div className="cop-people-today">
          <div><span>Incoming People</span><strong>{operations.incomingToday.toLocaleString('en-IN')}</strong></div>
          <div><span>People Transferred Out</span><strong>{operations.transferredOutToday.toLocaleString('en-IN')}</strong></div>
          <div><span>People Evacuated Today</span><strong>{operations.evacuatedToday.toLocaleString('en-IN')}</strong></div>
        </div>
      </section>

      <section className="lcc-panel cop-section">
        <div className="lcc-panel__heading">
          <p>SECTION 2 · MEDICAL</p>
          <h3><HeartPulse size={15} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />Medical capacity</h3>
        </div>
        <div className="cop-bed-row">
          <div className="cop-bed-stat"><span>Total Beds</span><strong>{operations.medical.totalBeds}</strong></div>
          <div className="cop-bed-stat"><span>Occupied Beds</span><strong>{operations.medical.occupiedBeds}</strong></div>
          <div className="cop-bed-stat"><span>Available Beds</span><strong>{operations.medical.totalBeds - operations.medical.occupiedBeds}</strong></div>
          <span className={`cop-supply-status cop-supply-status--${medicalStatus.toLowerCase()}`}>{emojiFor(levelFor(medicalStatus))} {medicalStatus}</span>
        </div>
        <div className="cop-occupancy-bar">
          <span className="cop-occupancy-bar__fill" style={{ width: `${bedOccupancyPct}%` }} />
        </div>
        <div className="cop-people-grid">
          <div><span>Doctors</span><strong>{operations.medical.doctors}</strong></div>
          <div><span>Nurses</span><strong>{operations.medical.nurses}</strong></div>
          <div><span>Ambulances</span><strong>{operations.medical.ambulances}</strong></div>
          <div><span>Medical Kits</span><strong>{operations.medical.medicalKits}</strong></div>
          <div className="cop-people-grid__critical"><span>Critical Patients</span><strong>{operations.medical.criticalPatients}</strong></div>
        </div>
      </section>

      <div className="cop-panel-row">
        <section className="lcc-panel cop-section">
          <div className="lcc-panel__heading">
            <p>SECTION 3 · FOOD</p>
            <h3><ClipboardList size={15} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />Food supply</h3>
          </div>
          <div className="cop-supply-grid">
            <div><span>Daily Requirement</span><strong>{foodDailyRequirement.toLocaleString('en-IN')} meals</strong></div>
            <div><span>Available Stock</span><strong>{operations.food.availableStock.toLocaleString('en-IN')} meals</strong></div>
            <div><span>Estimated Coverage</span><strong>{foodCoverageDays} days</strong></div>
          </div>
          <span className={`cop-supply-status cop-supply-status--${foodStatus.toLowerCase()}`}>{emojiFor(levelFor(foodStatus))} {foodStatus}</span>
        </section>

        <section className="lcc-panel cop-section">
          <div className="lcc-panel__heading">
            <p>SECTION 4 · WATER</p>
            <h3><Droplet size={15} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />Water supply</h3>
          </div>
          <div className="cop-supply-grid">
            <div><span>Daily Requirement</span><strong>{waterDailyRequirement.toLocaleString('en-IN')} L</strong></div>
            <div><span>Available</span><strong>{operations.water.availableStock.toLocaleString('en-IN')} L</strong></div>
            <div><span>Estimated Coverage</span><strong>{waterCoverageDays} days</strong></div>
          </div>
          <span className={`cop-supply-status cop-supply-status--${waterStatus.toLowerCase()}`}>{emojiFor(levelFor(waterStatus))} {waterStatus}</span>
        </section>
      </div>

      <section className="lcc-panel cop-section">
        <div className="lcc-panel__heading">
          <p>SECTION 5 · ESSENTIAL RESOURCES</p>
          <h3><Package size={15} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />Resource stock</h3>
        </div>
        <div className="uwr-table-wrap">
          <table className="uwr-table cop-resource-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Available</th>
                <th>Required</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {operations.resources.map((resource) => (
                <tr key={resource.key}>
                  <td>{resource.label}</td>
                  <td>{resource.available.toLocaleString('en-IN')}{resource.unit ? ` ${resource.unit}` : ''}</td>
                  <td>{resource.required.toLocaleString('en-IN')}{resource.unit ? ` ${resource.unit}` : ''}</td>
                  <td>
                    <span className={`cop-supply-status cop-supply-status--${resource.status.toLowerCase()}`}>{emojiFor(levelFor(resource.status))} {resource.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lcc-panel cop-section">
        <div className="lcc-panel__heading">
          <p>SECTION 6 · STAFF</p>
          <h3><Radio size={15} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />On-site personnel</h3>
        </div>
        <div className="cop-people-grid cop-people-grid--staff">
          <div><span>Doctors</span><strong>{operations.medical.doctors}</strong></div>
          <div><span>Nurses</span><strong>{operations.medical.nurses}</strong></div>
          <div><span>Volunteers</span><strong>{operations.staff.volunteers}</strong></div>
          <div><span>Security</span><strong>{operations.staff.security}</strong></div>
          <div><span>Emergency Response Personnel</span><strong>{operations.staff.emergencyResponsePersonnel}</strong></div>
        </div>
      </section>

      <section className="lcc-panel cop-section cop-live">
        <div className="lcc-panel__heading">
          <p>SECTION 7 · LIVE CENTRE STATUS</p>
          <h3><Activity size={15} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />Real-time snapshot</h3>
        </div>
        <div className="cop-live-grid">
          <div><span>Current Occupancy</span><strong>{safeArea.occupancy}%</strong></div>
          <div><span>Incoming Evacuees</span><strong>{operations.incomingToday}</strong></div>
          <div><span>Outgoing Transfers</span><strong>{operations.transferredOutToday}</strong></div>
          <div><span>Medical Emergencies</span><strong>{operations.medicalEmergenciesToday}</strong></div>
          <div className={resourceAlerts > 0 ? 'cop-live-grid__alert' : ''}>
            <span>Resource Alerts</span>
            <strong>{resourceAlerts}</strong>
          </div>
        </div>
      </section>

      <section className="lcc-panel cop-section">
        <div className="lcc-panel__heading">
          <p>SECTION 8 · ACTIONS</p>
          <h3>Operational actions</h3>
        </div>
        <div className="cop-action-grid">
          <button className="cop-action-button" onClick={() => openAction('resource')} type="button">
            <Plus size={15} /> Add Resource
          </button>
          <button className="cop-action-button" onClick={() => openAction('occupancy')} type="button">
            <Users size={15} /> Update Occupancy
          </button>
          <button className="cop-action-button" onClick={() => openAction('incoming')} type="button">
            <UserPlus size={15} /> Register Incoming People
          </button>
          <button className="cop-action-button" onClick={() => openAction('transfer')} type="button">
            <Truck size={15} /> Transfer People
          </button>
          <button className="cop-action-button" onClick={() => openAction('medical')} type="button">
            <HeartPulse size={15} /> Request Medical Support
          </button>
          <button className="cop-action-button" onClick={() => openAction('food')} type="button">
            <ClipboardList size={15} /> Request Food
          </button>
          <button className="cop-action-button" onClick={() => openAction('water')} type="button">
            <Droplet size={15} /> Request Water
          </button>
          <button className="cop-action-button cop-action-button--danger" onClick={() => setShowDeactivate(true)} type="button">
            <ShieldAlert size={15} /> Deactivate Centre
          </button>
        </div>
      </section>

      {actionType && actionForm && (
        <div className="review-modal-backdrop" aria-modal="true" role="dialog">
          <form className="review-modal" onSubmit={handleActionSubmit}>
            <button className="review-modal__close" onClick={closeAction} type="button" aria-label="Close action panel">
              <X size={16} />
            </button>
            <div className="review-modal__header">
              <p>CENTRE ACTION</p>
              <button className="review-modal__dismiss" onClick={closeAction} type="button">
                Close popup
              </button>
            </div>
            <h2>{ACTION_DEFS[actionType].title}</h2>

            {actionType === 'occupancy' && (
              <label className="uwr-field">
                <span>New total population</span>
                <input
                  min="0"
                  onChange={(event) => setActionForm({ value: event.target.value })}
                  type="number"
                  value={actionForm.value}
                />
              </label>
            )}

            {actionType === 'incoming' && (
              <label className="uwr-field">
                <span>Number of people arriving</span>
                <input
                  min="0"
                  onChange={(event) => setActionForm({ value: event.target.value })}
                  type="number"
                  value={actionForm.value}
                />
              </label>
            )}

            {actionType === 'transfer' && (
              <div className="uwr-form-grid">
                <label className="uwr-field">
                  <span>Number of people</span>
                  <input
                    min="0"
                    onChange={(event) => setActionForm((current) => ({ ...current, value: event.target.value }))}
                    type="number"
                    value={actionForm.value}
                  />
                </label>
                <label className="uwr-field">
                  <span>Destination</span>
                  {otherActiveCentres.length > 0 ? (
                    <select
                      onChange={(event) => setActionForm((current) => ({ ...current, destinationId: event.target.value }))}
                      value={actionForm.destinationId}
                    >
                      {otherActiveCentres.map((area) => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      onChange={(event) => setActionForm((current) => ({ ...current, destinationText: event.target.value }))}
                      placeholder="Destination facility"
                      type="text"
                      value={actionForm.destinationText}
                    />
                  )}
                </label>
              </div>
            )}

            {actionType === 'medical' && (
              <label className="uwr-field">
                <span>Request details</span>
                <input
                  onChange={(event) => setActionForm({ note: event.target.value })}
                  placeholder="e.g. Additional trauma team required"
                  type="text"
                  value={actionForm.note}
                />
              </label>
            )}

            {actionType === 'food' && (
              <label className="uwr-field">
                <span>Additional meals requested</span>
                <input
                  min="0"
                  onChange={(event) => setActionForm({ value: event.target.value })}
                  type="number"
                  value={actionForm.value}
                />
              </label>
            )}

            {actionType === 'water' && (
              <label className="uwr-field">
                <span>Additional water requested (L)</span>
                <input
                  min="0"
                  onChange={(event) => setActionForm({ value: event.target.value })}
                  type="number"
                  value={actionForm.value}
                />
              </label>
            )}

            {actionType === 'resource' && (
              <div className="uwr-form-grid">
                <label className="uwr-field">
                  <span>Resource</span>
                  <select
                    onChange={(event) => setActionForm((current) => ({ ...current, resourceKey: event.target.value }))}
                    value={actionForm.resourceKey}
                  >
                    {RESOURCE_DEFINITIONS.map((resource) => (
                      <option key={resource.key} value={resource.key}>{resource.label}</option>
                    ))}
                  </select>
                </label>
                <label className="uwr-field">
                  <span>Quantity to add</span>
                  <input
                    min="0"
                    onChange={(event) => setActionForm((current) => ({ ...current, value: event.target.value }))}
                    type="number"
                    value={actionForm.value}
                  />
                </label>
              </div>
            )}

            <div className="review-decision">
              <div className="review-decision__buttons">
                <button className="review-decision__approve" type="submit">
                  <Check size={15} /> CONFIRM
                </button>
              </div>
              <div className="review-modal__footer">
                <button className="review-modal__dismiss review-modal__dismiss--footer" onClick={closeAction} type="button">
                  Close popup
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {showDeactivate && (
        <div className="review-modal-backdrop" aria-modal="true" role="dialog">
          <form className="review-modal" onSubmit={handleConfirmDeactivate}>
            <button className="review-modal__close" onClick={() => setShowDeactivate(false)} type="button" aria-label="Close deactivation form">
              <X size={16} />
            </button>
            <div className="review-modal__header">
              <p>REMOVE FROM ACTIVE OPERATIONS</p>
              <button className="review-modal__dismiss" onClick={() => setShowDeactivate(false)} type="button">
                Close popup
              </button>
            </div>
            <h2>{safeArea.name}</h2>
            <p>
              This centre will be marked <strong>INACTIVE</strong> and kept in incident history. It will no longer be
              recommended for evacuation, but its records are retained for audit purposes.
            </p>

            <div className="review-details-block">
              <h3>Reason for removal</h3>
              <div className="rcm-reason-grid">
                {DEACTIVATION_REASONS.map((reason) => (
                  <label className={`uwr-team-card${deactivateReason === reason ? ' is-selected' : ''}`} key={reason}>
                    <input
                      checked={deactivateReason === reason}
                      name="deactivateReason"
                      onChange={() => setDeactivateReason(reason)}
                      type="radio"
                      value={reason}
                    />
                    <strong>{reason}</strong>
                  </label>
                ))}
              </div>

              {deactivateReason === 'Other' && (
                <label className="uwr-field rcm-other-reason">
                  <span>Specify reason</span>
                  <input
                    onChange={(event) => setDeactivateOtherReason(event.target.value)}
                    type="text"
                    value={deactivateOtherReason}
                  />
                </label>
              )}
            </div>

            <div className="review-decision">
              <div className="review-decision__buttons">
                <button className="review-decision__reject" type="submit">
                  <X size={15} /> CONFIRM REMOVAL
                </button>
              </div>
              <div className="review-modal__footer">
                <button className="review-modal__dismiss review-modal__dismiss--footer" onClick={() => setShowDeactivate(false)} type="button">
                  Close popup
                </button>
              </div>
            </div>
          </form>
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
  );
}

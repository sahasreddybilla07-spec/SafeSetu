import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Clock3,
  MapPinned,
  Plus,
  ShieldAlert,
  Siren,
  X,
} from 'lucide-react';
import L from 'leaflet';
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { getControlRoomLocation } from '../data/controlRoomLocations';
import HazardRipple from '../map/HazardRipple';
import RoadRoute from '../map/RoadRoute';
import SafeAreaDots from '../map/SafeAreaDots';
import UserLocationMarker from '../map/UserLocationMarker';
import {
  applyLocationDecision,
  createRelocationCentre,
  deactivateRelocationCentre,
  getHazardDemoData,
  saveHazardDemoData,
} from '../data/hazardDemo';
import { assignHelpToGroup, getUnsafeRouteGroups, responseTeams, vehicleOptions } from '../data/unsafeRouteGroups';
import { getCentreStatusSummary } from '../data/centreOperations';
import { getBlockedRoads, getResponseTeamPositions } from '../data/mapOperationalLayers';
import { emojiFor, levelFor, riskLevelFor } from '../utils/statusLevels';

const ROUTE_BLOCKED_PATTERN = /(block|collapse|washed away|debris)/i;

const hazardMarkerIcon = L.divIcon({
  className: 'control-room-marker-wrapper',
  html: '<div class="control-room-marker">⚠</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const hospitalMarkerIcon = L.divIcon({
  className: 'lcc-hospital-marker-wrapper',
  html: '<div class="lcc-hospital-marker">+</div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const groupRiskIcon = {
  CRITICAL: L.divIcon({
    className: 'lcc-group-marker-wrapper',
    html: '<div class="lcc-group-marker lcc-group-marker--critical">!</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }),
  HIGH: L.divIcon({
    className: 'lcc-group-marker-wrapper',
    html: '<div class="lcc-group-marker lcc-group-marker--high">!</div>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  }),
  MODERATE: L.divIcon({
    className: 'lcc-group-marker-wrapper',
    html: '<div class="lcc-group-marker lcc-group-marker--moderate">!</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }),
};

const blockedRoadMarkerIcon = L.divIcon({
  className: 'lcc-blocked-marker-wrapper',
  html: '<div class="lcc-blocked-marker">✕</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const responseTeamMarkerIcon = L.divIcon({
  className: 'lcc-team-marker-wrapper',
  html: '<div class="lcc-team-marker">T</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const LAYER_DEFS = [
  { key: 'hazardBoundary', label: 'Hazard Boundary' },
  { key: 'highRiskZones', label: 'High Risk Zones' },
  { key: 'populationDensity', label: 'Population Density' },
  { key: 'unsafeGroups', label: 'People Without Safe Routes' },
  { key: 'safeRoutes', label: 'Safe Evacuation Routes' },
  { key: 'blockedRoads', label: 'Blocked Roads' },
  { key: 'relocationCentres', label: 'Relocation Centres' },
  { key: 'hospitals', label: 'Hospitals' },
  { key: 'responseTeams', label: 'Response Teams' },
];

const DEFAULT_LAYER_STATE = LAYER_DEFS.reduce((acc, layer) => ({ ...acc, [layer.key]: true }), {});

function centreStatusLabel(area) {
  if (area.operationalStatus === 'INACTIVE') return 'INACTIVE';
  if (area.approvalStatus === 'REJECTED') return 'REJECTED';
  if (area.approvalStatus === 'PENDING') return 'PENDING APPROVAL';
  return area.occupancy >= 85 ? 'NEAR CAPACITY' : 'ACTIVE';
}

function midpoint(positions) {
  const [[lat1, lng1], [lat2, lng2]] = positions;
  return [(lat1 + lat2) / 2, (lng1 + lng2) / 2];
}

function FlyToGroup({ position, zoom = 12 }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom, { duration: 0.8 });
    }
  }, [position, zoom, map]);

  return null;
}

const DEACTIVATION_REASONS = [
  'Capacity exhausted',
  'Unsafe conditions',
  'Flooding',
  'Medical emergency',
  'Resources depleted',
  'Disaster situation changed',
  'Other',
];

const DEMOGRAPHIC_SPLIT = [
  { label: 'Children (0–12)', share: 0.18 },
  { label: 'Women', share: 0.49 },
  { label: 'Elderly (60+)', share: 0.14 },
  { label: 'Persons with Disabilities', share: 0.03 },
];

function offsetPosition([lat, lng], dLat, dLng) {
  return [lat + dLat, lng + dLng];
}

export default function LocationCommandCentre() {
  const navigate = useNavigate();
  const { hazardId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [reviewItemId, setReviewItemId] = useState(null);
  const [notice, setNotice] = useState('');
  const [acknowledgedActions, setAcknowledgedActions] = useState([]);
  const [focusedGroupId, setFocusedGroupId] = useState(null);
  const [assignModalGroupId, setAssignModalGroupId] = useState(null);
  const [assignForm, setAssignForm] = useState(null);
  const [showAllotForm, setShowAllotForm] = useState(false);
  const [allotForm, setAllotForm] = useState(null);
  const [deactivateTargetId, setDeactivateTargetId] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState(DEACTIVATION_REASONS[0]);
  const [deactivateOtherReason, setDeactivateOtherReason] = useState('');
  const [activeLayers, setActiveLayers] = useState(DEFAULT_LAYER_STATE);
  const mapSectionRef = useRef(null);
  const centresSectionRef = useRef(null);
  const unsafeRouteSectionRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem('safesetu-gov-auth') !== 'true') {
      navigate('/government/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleStateUpdate = () => setRefreshKey((value) => value + 1);
    window.addEventListener('safesetu-hazard-demo-updated', handleStateUpdate);
    window.addEventListener('safesetu-unsafe-route-updated', handleStateUpdate);
    window.addEventListener('storage', handleStateUpdate);
    return () => {
      window.removeEventListener('safesetu-hazard-demo-updated', handleStateUpdate);
      window.removeEventListener('safesetu-unsafe-route-updated', handleStateUpdate);
      window.removeEventListener('storage', handleStateUpdate);
    };
  }, []);

  useEffect(() => {
    if (!hazardId) return;
    const data = getHazardDemoData();
    if (!data.hazards.some((item) => item.id === hazardId)) return;
    if (data.activeHazardId !== hazardId) {
      saveHazardDemoData({ activeHazardId: hazardId, hazards: data.hazards });
      setRefreshKey((value) => value + 1);
    }
  }, [hazardId]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const locationMeta = useMemo(() => getControlRoomLocation(hazardId), [hazardId]);
  const demoData = useMemo(() => getHazardDemoData(), [refreshKey]);
  const hazard = useMemo(() => demoData.hazards.find((item) => item.id === hazardId) ?? null, [demoData, hazardId]);

  if (!locationMeta || !hazard) {
    return (
      <main className="control-room-location-map control-room-location-map--empty">
        <p>LOCATION UNAVAILABLE</p>
        <h1>Hazard location not found</h1>
        <button onClick={() => navigate('/government/control-room')} type="button">
          <ArrowLeft size={16} /> Back to Active Hazard Locations
        </button>
      </main>
    );
  }

  const relocationAreas = hazard.relocationAreas;
  const pendingLocations = relocationAreas.filter((area) => area.approvalStatus === 'PENDING');
  const rejectedLocations = relocationAreas.filter((area) => area.approvalStatus === 'REJECTED');
  const activeCentres = relocationAreas.filter((area) => area.approvalStatus === 'APPROVED' && area.operationalStatus === 'ACTIVE');
  const inactiveCentres = relocationAreas.filter((area) => area.operationalStatus === 'INACTIVE');
  const approvedCentresCount = relocationAreas.filter((area) => area.approvalStatus === 'APPROVED').length;
  const nearCapacityLocations = activeCentres.filter((area) => area.occupancy >= 85);
  const deactivateTarget = deactivateTargetId
    ? relocationAreas.find((area) => area.id === deactivateTargetId) ?? null
    : null;

  const peopleRemaining = Math.max(0, locationMeta.peopleAtRisk - locationMeta.peopleEvacuated);
  const highlightedReviewItem = reviewItemId
    ? relocationAreas.find((area) => area.id === reviewItemId) ?? null
    : null;

  const unsafeGroups = getUnsafeRouteGroups(hazardId);
  const totalRequiringAssistance = unsafeGroups.reduce((sum, group) => sum + group.peopleCount, 0);
  const unassignedGroupsCount = unsafeGroups.filter((group) => group.status === 'UNASSIGNED').length;
  const assignedGroupsCount = unsafeGroups.filter((group) => group.status === 'ASSIGNED').length;
  const focusedGroup = unsafeGroups.find((group) => group.id === focusedGroupId) ?? null;
  const assignModalGroup = unsafeGroups.find((group) => group.id === assignModalGroupId) ?? null;

  function getCentreById(centreId) {
    return relocationAreas.find((area) => area.id === centreId) ?? null;
  }

  function getCentreName(centreId) {
    return getCentreById(centreId)?.name ?? 'Not yet identified';
  }

  function handleViewGroupOnMap(groupId) {
    setFocusedGroupId(groupId);
    scrollToSection(mapSectionRef);
  }

  function handleOpenAssign(group) {
    setAssignModalGroupId(group.id);
    setAssignForm({
      teamId: responseTeams[0].id,
      vehicle: vehicleOptions[0],
      medical: true,
      foodWater: true,
      destinationId: group.nearestCentreId ?? relocationAreas[0]?.id ?? '',
    });
  }

  function handleCloseAssign() {
    setAssignModalGroupId(null);
    setAssignForm(null);
  }

  function handleSubmitAssignment(event) {
    event.preventDefault();
    if (!assignModalGroup || !assignForm) return;

    const team = responseTeams.find((item) => item.id === assignForm.teamId);
    const destination = getCentreById(assignForm.destinationId);
    const eta = `${28 + Math.floor(Math.random() * 35)} min`;
    const assignedAt = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });

    assignHelpToGroup(hazardId, assignModalGroup.id, {
      team: team?.name ?? 'Unassigned team',
      vehicle: assignForm.vehicle,
      medical: assignForm.medical,
      foodWater: assignForm.foodWater,
      destination: destination?.name ?? 'Not yet identified',
      eta,
      assignedAt: `${assignedAt} IST`,
    });

    setNotice(`Emergency assistance assigned to ${assignModalGroup.village}.`);
    handleCloseAssign();
    setRefreshKey((value) => value + 1);
  }

  function handleDecision(locationId, decision) {
    const currentArea = relocationAreas.find((area) => area.id === locationId);
    applyLocationDecision(locationId, decision, 'Control Room Admin');
    setReviewItemId(null);

    if (decision === 'APPROVED') {
      setNotice(
        currentArea?.approvalStatus === 'REJECTED'
          ? 'Rejected site reconsidered and restored to active recommendations.'
          : 'Location approved successfully.',
      );
    } else if (decision === 'PENDING') {
      setNotice('Location moved back to pending review.');
    } else {
      setNotice('Location rejected and removed from active recommendations.');
    }

    setRefreshKey((value) => value + 1);
  }

  function openAllotForm() {
    setAllotForm({
      name: '',
      location: '',
      latitude: String(hazard.hazardCenter?.[0] ?? ''),
      longitude: String(hazard.hazardCenter?.[1] ?? ''),
      capacity: '',
      medicalBeds: '',
      foodCapacity: '',
      waterCapacity: '',
      toilets: '',
      emergencyContact: '',
      routeSafety: '80',
      distanceKm: '',
      travelTime: '',
      emergencyActive: false,
    });
    setShowAllotForm(true);
  }

  function closeAllotForm() {
    setShowAllotForm(false);
    setAllotForm(null);
  }

  function updateAllotForm(field, value) {
    setAllotForm((current) => ({ ...current, [field]: value }));
  }

  function handleCreateCentre(event) {
    event.preventDefault();
    if (!allotForm || !allotForm.name.trim() || !allotForm.capacity) {
      setNotice('Centre name and capacity are required.');
      return;
    }

    createRelocationCentre(
      hazardId,
      {
        name: allotForm.name.trim(),
        location: allotForm.location.trim(),
        latitude: allotForm.latitude,
        longitude: allotForm.longitude,
        capacity: allotForm.capacity,
        medicalCapacity: allotForm.medicalBeds,
        foodCapacity: allotForm.foodCapacity.trim(),
        waterCapacity: allotForm.waterCapacity.trim(),
        toilets: allotForm.toilets,
        emergencyContact: allotForm.emergencyContact.trim(),
        safetyScore: allotForm.routeSafety,
        distanceKm: allotForm.distanceKm,
        travelTime: allotForm.travelTime.trim(),
      },
      { emergencyActive: allotForm.emergencyActive },
    );

    setNotice(
      allotForm.emergencyActive
        ? `${allotForm.name} activated immediately as an emergency relocation centre.`
        : `${allotForm.name} allotted and sent for government approval.`,
    );
    closeAllotForm();
    setRefreshKey((value) => value + 1);
  }

  function openDeactivateModal(locationId) {
    setDeactivateTargetId(locationId);
    setDeactivateReason(DEACTIVATION_REASONS[0]);
    setDeactivateOtherReason('');
  }

  function closeDeactivateModal() {
    setDeactivateTargetId(null);
    setDeactivateOtherReason('');
  }

  function handleConfirmDeactivate(event) {
    event.preventDefault();
    if (!deactivateTarget) return;

    const reason = deactivateReason === 'Other' ? (deactivateOtherReason.trim() || 'Other') : deactivateReason;
    deactivateRelocationCentre(deactivateTarget.id, reason, 'Control Room Admin');
    setNotice(`${deactivateTarget.name} removed from active operations.`);
    closeDeactivateModal();
    setRefreshKey((value) => value + 1);
  }

  function handleViewOnMap(locationId) {
    navigate(`/government/control-room/map/${encodeURIComponent(locationId)}`);
  }

  function scrollToSection(ref) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function acknowledgeAction(actionId) {
    setAcknowledgedActions((current) => [...current, actionId]);
  }

  function toggleLayer(key) {
    setActiveLayers((current) => ({ ...current, [key]: !current[key] }));
  }

  const actionItems = [];

  if (locationMeta.peopleWithoutSafeRoute > 0) {
    actionItems.push({
      id: 'no-safe-route',
      level: 'CRITICAL',
      text: `${locationMeta.peopleWithoutSafeRoute.toLocaleString('en-IN')} people without safe route`,
      buttonLabel: 'ASSIGN RESPONSE',
      onClick: () => scrollToSection(unsafeRouteSectionRef),
    });
  }

  unsafeGroups
    .filter((group) => ROUTE_BLOCKED_PATTERN.test(group.reason))
    .forEach((group) => {
      actionItems.push({
        id: `route-blocked-${group.id}`,
        level: 'CRITICAL',
        text: `Evacuation route blocked near ${group.village} (${group.reason})`,
        buttonLabel: 'VIEW MAP',
        onClick: () => handleViewGroupOnMap(group.id),
      });
    });

  activeCentres
    .filter((centre) => centre.occupancy >= 85)
    .forEach((centre) => {
      actionItems.push({
        id: `near-capacity-${centre.id}`,
        level: 'HIGH',
        text: `${centre.name} at ${centre.occupancy}% capacity`,
        buttonLabel: 'VIEW CENTRE',
        onClick: () => handleViewOnMap(centre.id),
      });
    });

  if (pendingLocations.length > 0) {
    actionItems.push({
      id: 'pending-review',
      level: 'HIGH',
      text: `${pendingLocations.length} relocation centre${pendingLocations.length > 1 ? 's' : ''} awaiting approval`,
      buttonLabel: 'REVIEW',
      onClick: () => scrollToSection(centresSectionRef),
    });
  }

  activeCentres.forEach((centre) => {
    const summary = getCentreStatusSummary(centre);

    if (summary.foodStatus !== 'SUFFICIENT') {
      actionItems.push({
        id: `food-${centre.id}`,
        level: summary.foodStatus === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        text: `${summary.foodStatus === 'CRITICAL' ? 'Critical' : 'Low'} food supply at ${centre.name}`,
        buttonLabel: 'VIEW CENTRE',
        onClick: () => handleViewOnMap(centre.id),
      });
    }

    if (summary.waterStatus !== 'SUFFICIENT') {
      actionItems.push({
        id: `water-${centre.id}`,
        level: summary.waterStatus === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        text: `${summary.waterStatus === 'CRITICAL' ? 'Critical' : 'Low'} water supply at ${centre.name}`,
        buttonLabel: 'VIEW CENTRE',
        onClick: () => handleViewOnMap(centre.id),
      });
    }

    if (summary.medicalStatus !== 'ADEQUATE') {
      actionItems.push({
        id: `medical-${centre.id}`,
        level: summary.medicalStatus === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        text: `${summary.medicalStatus === 'CRITICAL' ? 'Critical' : 'Strained'} medical capacity at ${centre.name}`,
        buttonLabel: 'VIEW CENTRE',
        onClick: () => handleViewOnMap(centre.id),
      });
    }
  });

  locationMeta.staticActions.forEach((action, index) => {
    actionItems.push({
      id: `static-${index}`,
      level: 'ATTENTION_REQUIRED',
      text: action.text,
      buttonLabel: 'ACKNOWLEDGE',
      onClick: () => acknowledgeAction(`static-${index}`),
    });
  });

  const ACTION_LEVEL_RANK = { CRITICAL: 0, HIGH: 1, MODERATE: 2, ATTENTION_REQUIRED: 3, STABLE: 4 };
  actionItems.sort((a, b) => (ACTION_LEVEL_RANK[a.level] ?? 5) - (ACTION_LEVEL_RANK[b.level] ?? 5));

  const visibleActionItems = actionItems
    .filter((item) => !acknowledgedActions.includes(item.id))
    .map((item) => ({
      ...item,
      tone: item.level === 'CRITICAL' ? 'critical' : item.level === 'HIGH' ? 'warning' : 'info',
      emoji: emojiFor(item.level),
    }));

  const primaryApprovedLocation = activeCentres[0] ?? null;
  const highRiskRadius = Math.round((hazard.hazardRadius ?? 0) * 0.4);

  const hospitalMarkers = [
    { name: 'District Hospital', position: offsetPosition(hazard.hazardCenter, 0.14, -0.11) },
    { name: 'Community Health Centre', position: offsetPosition(hazard.hazardCenter, -0.12, 0.13) },
  ];

  const blockedRoads = getBlockedRoads(hazardId);
  const responseTeamMarkers = getResponseTeamPositions(hazard)
    .map((slot, index) => {
      const team = responseTeams[index];
      if (!team) return null;

      const deployment = unsafeGroups.find(
        (group) => group.status === 'ASSIGNED' && group.assignment?.team === team.name,
      );

      return {
        ...team,
        position: slot.position,
        status: deployment ? `DEPLOYED · ${deployment.village}` : 'STANDING BY',
      };
    })
    .filter(Boolean);

  return (
    <div className="lcc-shell">
      <header className="lcc-topbar">
        <button className="lcc-back" onClick={() => navigate('/government/control-room')} type="button">
          <ArrowLeft size={16} /> All Active Hazard Locations
        </button>
        <span className="lcc-topbar__eyebrow">SAHAS · LOCATION COMMAND CENTRE</span>
      </header>

      <section className="lcc-location-header">
        <div className="lcc-location-header__title">
          <p className="lcc-eyebrow">{locationMeta.hazardType.toUpperCase()}</p>
          <h1>{locationMeta.district.toUpperCase()}</h1>
          <h2>{locationMeta.state.toUpperCase()}</h2>
        </div>
        <div className="lcc-location-header__status">
          <span className={`lcc-status-pill lcc-status-pill--${locationMeta.severity.toLowerCase()}`}>
            {emojiFor(levelFor(locationMeta.severity))} CURRENT STATUS: {locationMeta.severity}
          </span>
          <span className="lcc-updated"><Clock3 size={13} /> Last updated: {hazard.lastUpdated}</span>
        </div>
      </section>

      <section className="lcc-population-strip" aria-label="Population snapshot">
        <div>
          <span>Affected Area</span>
          <strong>{locationMeta.affectedAreaKm2.toLocaleString('en-IN')} km²</strong>
        </div>
        <div>
          <span>People at Risk</span>
          <strong>{locationMeta.peopleAtRisk.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span>People Evacuated</span>
          <strong>{locationMeta.peopleEvacuated.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span>People Remaining</span>
          <strong>{peopleRemaining.toLocaleString('en-IN')}</strong>
        </div>
        <div className="lcc-population-strip__alert">
          <span>Without Safe Route</span>
          <strong>{locationMeta.peopleWithoutSafeRoute.toLocaleString('en-IN')}</strong>
        </div>
      </section>

      <section className="lcc-panel lcc-priority-panel">
        <div className="lcc-panel__heading">
          <p>ACTION REQUIRED</p>
          <h3>What needs the officer's attention right now</h3>
        </div>
        <div className="lcc-action-list">
          {visibleActionItems.length === 0 ? (
            <div className="empty-state">🟢 No pending actions. Situation is stable.</div>
          ) : (
            visibleActionItems.map((item) => (
              <div className={`lcc-action-item lcc-action-item--${item.tone}`} key={item.id}>
                <span className="lcc-action-item__icon">
                  {item.tone === 'critical' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                </span>
                <span className="lcc-action-item__text">{item.emoji} {item.text}</span>
                <button className="lcc-action-item__button" onClick={item.onClick} type="button">
                  {item.buttonLabel}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="lcc-grid">
        <section className="lcc-panel">
          <div className="lcc-panel__heading">
            <p>HAZARD PARAMETERS</p>
            <h3>{locationMeta.hazardType} readings</h3>
          </div>
          <div className="lcc-param-grid">
            {locationMeta.hazardParameters.map((param) => (
              <div className="lcc-param" key={param.label}>
                <span>{param.label}</span>
                <strong>{param.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="lcc-panel lcc-map-panel" ref={mapSectionRef}>
          <div className="lcc-panel__heading">
            <p>SITUATIONAL AWARENESS</p>
            <h3>Affected area map</h3>
          </div>

          <div className="lcc-layer-control" aria-label="Map layers">
            {LAYER_DEFS.map((layer) => (
              <label className="lcc-layer-toggle" key={layer.key}>
                <input checked={activeLayers[layer.key]} onChange={() => toggleLayer(layer.key)} type="checkbox" />
                {layer.label}
              </label>
            ))}
          </div>

          <div className="lcc-map-frame">
            <MapContainer className="lcc-map" center={hazard.hazardCenter} scrollWheelZoom zoom={7.5}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {activeLayers.populationDensity && (
                <>
                  <Circle
                    center={hazard.hazardCenter}
                    pathOptions={{ color: '#5e4fa2', fillColor: '#5e4fa2', fillOpacity: 0.05, weight: 0 }}
                    radius={hazard.hazardRadius}
                  />
                  <Circle
                    center={hazard.hazardCenter}
                    pathOptions={{ color: '#5e4fa2', fillColor: '#5e4fa2', fillOpacity: 0.1, weight: 0 }}
                    radius={hazard.hazardRadius * 0.6}
                  />
                  <Circle
                    center={hazard.hazardCenter}
                    pathOptions={{ color: '#5e4fa2', fillColor: '#5e4fa2', fillOpacity: 0.18, weight: 0 }}
                    radius={hazard.hazardRadius * 0.3}
                  />
                </>
              )}

              {activeLayers.hazardBoundary && (
                <Circle
                  center={hazard.hazardCenter}
                  pathOptions={{ color: '#d9485f', fillColor: '#d9485f', fillOpacity: 0.12, weight: 2 }}
                  radius={hazard.hazardRadius}
                />
              )}
              <HazardRipple center={hazard.hazardCenter} color="#d9485f" radius={hazard.hazardRadius} />

              {activeLayers.highRiskZones && (
                <Circle
                  center={hazard.hazardCenter}
                  pathOptions={{ color: '#8d2d2d', fillColor: '#8d2d2d', fillOpacity: 0.22, weight: 2, dashArray: '4 4' }}
                  radius={highRiskRadius}
                />
              )}

              <Marker icon={hazardMarkerIcon} position={hazard.hazardCenter}>
                <Popup>
                  <strong>{locationMeta.hazardType}</strong>
                  <br />
                  {hazard.name}
                </Popup>
              </Marker>
              {hazard.userLocation?.position && <UserLocationMarker label={hazard.userLocation.label} position={hazard.userLocation.position} />}

              {activeLayers.unsafeGroups && unsafeGroups.map((group) => (
                <Marker
                  icon={groupRiskIcon[group.riskLevel] ?? groupRiskIcon.HIGH}
                  key={group.id}
                  position={group.position}
                >
                  <Popup>
                    <strong>{group.village}</strong>
                    <div className="lcc-map-popup__grid">
                      <span>Location</span><strong>{group.position[0].toFixed(4)}, {group.position[1].toFixed(4)}</strong>
                      <span>Number of People</span><strong>{group.peopleCount}</strong>
                      <span>Risk Level</span><strong>{emojiFor(riskLevelFor(group.riskLevel))} {group.riskLevel}</strong>
                      <span>Reason</span><strong>{group.reason}</strong>
                      <span>Nearest Centre</span><strong>{getCentreName(group.nearestCentreId)}</strong>
                      <span>Assigned Team</span><strong>{group.assignment?.team ?? 'Unassigned'}</strong>
                      <span>Status</span><strong>{group.status}</strong>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {focusedGroup && (
                <Circle
                  center={focusedGroup.position}
                  pathOptions={{ color: '#c9742d', fillColor: '#c9742d', fillOpacity: 0.15, weight: 2, dashArray: '4 4' }}
                  radius={1800}
                />
              )}

              {focusedGroup && <FlyToGroup position={focusedGroup.position} zoom={11} />}

              {activeLayers.hospitals && hospitalMarkers.map((hospital) => (
                <Marker icon={hospitalMarkerIcon} key={hospital.name} position={hospital.position}>
                  <Popup>
                    <strong>{hospital.name}</strong>
                  </Popup>
                </Marker>
              ))}

              {activeLayers.responseTeams && responseTeamMarkers.map((team) => (
                <Marker icon={responseTeamMarkerIcon} key={team.id} position={team.position}>
                  <Popup>
                    <strong>{team.name}</strong>
                    <div className="lcc-map-popup__grid">
                      <span>Personnel</span><strong>{team.personnel}</strong>
                      <span>Vehicles</span><strong>{team.vehicles}</strong>
                      <span>Medical Units</span><strong>{team.medicalUnits}</strong>
                      <span>Status</span><strong>{team.status}</strong>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {activeLayers.safeRoutes && hazard.userLocation?.position && primaryApprovedLocation && (
                <RoadRoute end={primaryApprovedLocation.position} start={hazard.userLocation.position} />
              )}

              {activeLayers.safeRoutes && focusedGroup && getCentreById(focusedGroup.nearestCentreId) && (
                <Polyline
                  pathOptions={{ color: '#c9742d', weight: 3, dashArray: '2 8' }}
                  positions={[focusedGroup.position, getCentreById(focusedGroup.nearestCentreId).position]}
                />
              )}

              {activeLayers.blockedRoads && blockedRoads.map((road) => (
                <Fragment key={road.id}>
                  <Polyline pathOptions={{ color: '#8d2d2d', weight: 4 }} positions={road.positions}>
                    <Popup>
                      <strong>{road.name}</strong>
                      <div className="lcc-map-popup__grid">
                        <span>Reason</span><strong>{road.reason}</strong>
                        <span>Affected Area</span><strong>{road.affectedArea}</strong>
                        <span>Alternative Route</span><strong>{road.alternativeRoute}</strong>
                        <span>Est. Clearance</span><strong>{road.clearanceTime}</strong>
                      </div>
                    </Popup>
                  </Polyline>
                  <Marker icon={blockedRoadMarkerIcon} position={midpoint(road.positions)}>
                    <Popup>
                      <strong>{road.name}</strong>
                      <div className="lcc-map-popup__grid">
                        <span>Reason</span><strong>{road.reason}</strong>
                        <span>Affected Area</span><strong>{road.affectedArea}</strong>
                        <span>Alternative Route</span><strong>{road.alternativeRoute}</strong>
                        <span>Est. Clearance</span><strong>{road.clearanceTime}</strong>
                      </div>
                    </Popup>
                  </Marker>
                </Fragment>
              ))}

              {activeLayers.relocationCentres && relocationAreas.map((area) => {
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
                      <div className="lcc-map-popup__grid">
                        <span>Capacity</span><strong>{area.capacity}</strong>
                        <span>Occupancy</span><strong>{area.peoplePresent} ({area.occupancy}%)</strong>
                        <span>Available</span><strong>{area.available}</strong>
                        <span>Medical Beds</span><strong>{area.medicalCapacity}</strong>
                        <span>Route Safety</span><strong>{area.safetyScore}%</strong>
                        <span>Status</span><strong>{emojiFor(levelFor(centreStatusLabel(area)))} {centreStatusLabel(area)}</strong>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            <div className="lcc-map-legend">
              <span><i className="legend-dot legend-dot--critical" />High-risk zone</span>
              <span><i className="legend-dot legend-dot--warning" />Hazard boundary</span>
              <span><i className="legend-dot legend-dot--approved" />Approved centre</span>
              <span><i className="legend-dot legend-dot--pending" />Pending review</span>
              <span><i className="legend-dot legend-dot--rejected" />Rejected</span>
              <span><MapPinned size={13} /> Hospital</span>
              <span><ShieldAlert size={13} /> No safe route</span>
            </div>
          </div>
        </section>
      </div>

      <section className="lcc-panel">
        <div className="lcc-panel__heading">
          <p>POPULATION IMPACT</p>
          <h3>People at risk</h3>
        </div>
        <div className="lcc-population-numbers">
          <div>
            <span>Total</span>
            <strong>{locationMeta.peopleAtRisk.toLocaleString('en-IN')}</strong>
          </div>
          <div className="lcc-population-numbers__safe">
            <span>Evacuated</span>
            <strong>{locationMeta.peopleEvacuated.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong>{peopleRemaining.toLocaleString('en-IN')}</strong>
          </div>
          <div className="lcc-population-numbers__alert">
            <span>Without Safe Route</span>
            <strong>{locationMeta.peopleWithoutSafeRoute.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="lcc-demographics">
          {DEMOGRAPHIC_SPLIT.map((group) => (
            <div className="lcc-demographics__item" key={group.label}>
              <span>{group.label}</span>
              <strong>{Math.round(locationMeta.peopleAtRisk * group.share).toLocaleString('en-IN')}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="lcc-panel uwr-panel" ref={unsafeRouteSectionRef}>
        <div className="uwr-heading">
          <div className="uwr-heading__title">
            <Siren size={20} />
            <h3>PEOPLE WITHOUT SAFE EVACUATION ROUTE</h3>
          </div>
          <div className="uwr-heading__stats">
            <div className="uwr-heading__count">
              <strong>{totalRequiringAssistance.toLocaleString('en-IN')}</strong>
              <span>PEOPLE REQUIRE ASSISTANCE</span>
            </div>
            <div className="uwr-heading__chip uwr-heading__chip--unassigned">
              <strong>{unassignedGroupsCount}</strong>
              <span>🔴 Unassigned Groups</span>
            </div>
            <div className="uwr-heading__chip uwr-heading__chip--assigned">
              <strong>{assignedGroupsCount}</strong>
              <span>🟢 Assigned Groups</span>
            </div>
          </div>
        </div>

        <div className="uwr-table-wrap">
          <table className="uwr-table">
            <thead>
              <tr>
                <th>Group ID</th>
                <th>Location / Village</th>
                <th>Coordinates</th>
                <th>People</th>
                <th>Risk Level</th>
                <th>Reason</th>
                <th>Nearest Safe Centre</th>
                <th>Required Assistance</th>
                <th>Response Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {unsafeGroups.map((group) => (
                <tr key={group.id}>
                  <td>{group.id.toUpperCase()}</td>
                  <td>{group.village}</td>
                  <td>{group.position[0].toFixed(4)}, {group.position[1].toFixed(4)}</td>
                  <td>{group.peopleCount}</td>
                  <td>
                    <span className={`severity-badge severity-badge--${group.riskLevel === 'CRITICAL' ? 'critical' : group.riskLevel === 'HIGH' ? 'high' : 'warning'}`}>
                      {emojiFor(riskLevelFor(group.riskLevel))} {group.riskLevel}
                    </span>
                  </td>
                  <td>{group.reason}</td>
                  <td>{getCentreName(group.nearestCentreId)}</td>
                  <td>{group.requiredAssistance}</td>
                  <td>
                    <span className={`uwr-status uwr-status--${group.status.toLowerCase()}`}>
                      {group.status === 'ASSIGNED' ? '🟢' : '🔴'} {group.status}
                    </span>
                    {group.status === 'ASSIGNED' && group.assignment && (
                      <div className="uwr-status-detail">
                        <span>{group.assignment.team}</span>
                        <span>ETA {group.assignment.eta} → {group.assignment.destination}</span>
                        <span>{group.assignment.assignedAt}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="uwr-actions">
                      <button className="uwr-action-secondary" onClick={() => handleViewGroupOnMap(group.id)} type="button">
                        VIEW ON MAP
                      </button>
                      <button className="uwr-action-primary" onClick={() => handleOpenAssign(group)} type="button">
                        {group.status === 'ASSIGNED' ? 'REASSIGN' : 'ASSIGN HELP'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lcc-panel rcm-panel" ref={centresSectionRef}>
        <div className="rcm-heading">
          <div className="lcc-panel__heading">
            <p>RELOCATION CENTRES</p>
            <h3>{relocationAreas.length} centres tracked for this hazard</h3>
          </div>
          <button className="rcm-allot-button" onClick={openAllotForm} type="button">
            <Plus size={15} /> ALLOT RELOCATION CENTRE
          </button>
        </div>

        <div className="rcm-summary">
          <div>
            <span>Total Centres</span>
            <strong>{relocationAreas.length}</strong>
          </div>
          <div>
            <span>Approved</span>
            <strong>{approvedCentresCount}</strong>
          </div>
          <div className="rcm-summary__warning">
            <span>Awaiting Approval</span>
            <strong>{pendingLocations.length}</strong>
          </div>
          <div className="rcm-summary__success">
            <span>Active</span>
            <strong>{activeCentres.length}</strong>
          </div>
          <div className="rcm-summary__warning">
            <span>Near Capacity</span>
            <strong>{nearCapacityLocations.length}</strong>
          </div>
          <div className="rcm-summary__muted">
            <span>Inactive</span>
            <strong>{inactiveCentres.length}</strong>
          </div>
        </div>

        <div className="rcm-group">
          <h4>ACTIVE CENTRES</h4>
          {activeCentres.length === 0 ? (
            <div className="empty-state">No centres are currently active for evacuation.</div>
          ) : (
            <div className="rcm-card-grid">
              {activeCentres.map((centre) => {
                const nearCapacity = centre.occupancy >= 85;
                return (
                  <article className={`rcm-card${nearCapacity ? ' rcm-card--warning' : ' rcm-card--active'}`} key={centre.id}>
                    <div className="rcm-card__top">
                      <div>
                        <h4>{centre.name}</h4>
                        <span className="rcm-card__address">{centre.address}</span>
                      </div>
                      <span className={`rcm-status-pill rcm-status-pill--${nearCapacity ? 'warning' : 'active'}`}>
                        {nearCapacity ? '🟠 NEAR CAPACITY' : '🟢 ACTIVE'}
                      </span>
                    </div>
                    <div className="rcm-card__stats">
                      <div><span>Capacity</span><strong>{centre.capacity}</strong></div>
                      <div><span>Occupancy</span><strong>{centre.peoplePresent} ({centre.occupancy}%)</strong></div>
                      <div><span>Available</span><strong>{centre.available}</strong></div>
                      <div><span>Route Safety</span><strong>{centre.safetyScore}%</strong></div>
                      <div><span>Distance</span><strong>{centre.distanceKm} km</strong></div>
                      <div><span>Travel Time</span><strong>{centre.travelTime}</strong></div>
                      <div><span>Medical Capacity</span><strong>{centre.medicalCapacity} beds</strong></div>
                      <div><span>Food Status</span><strong>{centre.foodStatus}</strong></div>
                      <div><span>Water Status</span><strong>{centre.waterStatus}</strong></div>
                    </div>
                    <div className="rcm-card__actions">
                      <button className="control-room-secondary-button" onClick={() => handleViewOnMap(centre.id)} type="button">
                        VIEW CENTRE
                      </button>
                      <button className="rcm-action-danger" onClick={() => openDeactivateModal(centre.id)} type="button">
                        DEACTIVATE
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="rcm-group">
          <h4>AWAITING APPROVAL</h4>
          {pendingLocations.length === 0 ? (
            <div className="empty-state">No locations are currently awaiting review.</div>
          ) : (
            <div className="rcm-card-grid">
              {pendingLocations.map((candidate) => (
                <article className="rcm-card rcm-card--pending" key={candidate.id}>
                  <div className="rcm-card__top">
                    <div>
                      <h4>{candidate.name}</h4>
                      <span className="rcm-card__address">{candidate.address}</span>
                    </div>
                    <span className="rcm-status-pill rcm-status-pill--pending">🔵 PENDING REVIEW</span>
                  </div>
                  <div className="rcm-card__stats">
                    <div><span>Capacity</span><strong>{candidate.capacity}</strong></div>
                    <div><span>Occupancy</span><strong>{candidate.peoplePresent} ({candidate.occupancy}%)</strong></div>
                    <div><span>Available</span><strong>{candidate.available}</strong></div>
                    <div><span>Route Safety</span><strong>{candidate.safetyScore}%</strong></div>
                    <div>
                      <span>Risk</span>
                      <strong className={`severity-badge severity-badge--${candidate.riskLevel === 'LOW' ? 'safe' : candidate.riskLevel === 'HIGH' ? 'high' : 'warning'}`}>
                        {emojiFor(riskLevelFor(candidate.riskLevel))} {candidate.riskLevel}
                      </strong>
                    </div>
                  </div>
                  <div className="rcm-card__actions">
                    <button className="control-room-secondary-button" onClick={() => setReviewItemId(candidate.id)} type="button">
                      REVIEW
                    </button>
                    <button className="rcm-action-approve" onClick={() => handleDecision(candidate.id, 'APPROVED')} type="button">
                      APPROVE
                    </button>
                    <button className="rcm-action-danger" onClick={() => handleDecision(candidate.id, 'REJECTED')} type="button">
                      REJECT
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rcm-group">
          <h4>REJECTED PROPOSALS</h4>
          {rejectedLocations.length === 0 ? (
            <div className="empty-state">No rejected sites currently waiting for reconsideration.</div>
          ) : (
            <div className="rcm-card-grid">
              {rejectedLocations.map((location) => (
                <article className="rcm-card rcm-card--rejected" key={location.id}>
                  <div className="rcm-card__top">
                    <div>
                      <h4>{location.name}</h4>
                      <span className="rcm-card__address">{location.address}</span>
                    </div>
                    <span className="rcm-status-pill rcm-status-pill--rejected">⚪ REJECTED</span>
                  </div>
                  <div className="rcm-card__reason">Reason: {location.reviewNote || 'Manual review did not approve this site.'}</div>
                  <div className="rcm-card__actions">
                    <button className="control-room-secondary-button" onClick={() => setReviewItemId(location.id)} type="button">
                      REVIEW
                    </button>
                    <button className="rcm-action-approve" onClick={() => handleDecision(location.id, 'APPROVED')} type="button">
                      APPROVE
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rcm-group">
          <h4>INACTIVE / REMOVED FROM OPERATIONS</h4>
          {inactiveCentres.length === 0 ? (
            <div className="empty-state">No centres have been removed from operations.</div>
          ) : (
            <div className="rcm-card-grid">
              {inactiveCentres.map((centre) => (
                <article className="rcm-card rcm-card--inactive" key={centre.id}>
                  <div className="rcm-card__top">
                    <div>
                      <h4>{centre.name}</h4>
                      <span className="rcm-card__address">{centre.address}</span>
                    </div>
                    <span className="rcm-status-pill rcm-status-pill--inactive">⚪ INACTIVE</span>
                  </div>
                  <div className="rcm-card__stats">
                    <div><span>Capacity</span><strong>{centre.capacity}</strong></div>
                    <div><span>Last Occupancy</span><strong>{centre.peoplePresent} ({centre.occupancy}%)</strong></div>
                  </div>
                  <div className="rcm-card__reason">
                    <span>Reason: {centre.inactiveReason}</span>
                    {centre.inactivatedAt && (
                      <span>
                        Removed:{' '}
                        {new Date(centre.inactivatedAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                          timeZone: 'Asia/Kolkata',
                        })}{' '}
                        IST
                      </span>
                    )}
                  </div>
                  <div className="rcm-card__actions">
                    <button className="control-room-secondary-button" onClick={() => handleViewOnMap(centre.id)} type="button">
                      VIEW CENTRE
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

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
              <div className="review-modal__footer">
                <button className="review-modal__dismiss review-modal__dismiss--footer" onClick={() => setReviewItemId(null)} type="button">
                  Close popup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {assignModalGroup && assignForm && (
        <div className="review-modal-backdrop" aria-modal="true" role="dialog">
          <form className="review-modal uwr-assign-modal" onSubmit={handleSubmitAssignment}>
            <button className="review-modal__close" onClick={handleCloseAssign} type="button" aria-label="Close assignment panel">
              <X size={16} />
            </button>
            <div className="review-modal__header">
              <p>EMERGENCY ASSIGNMENT</p>
              <button className="review-modal__dismiss" onClick={handleCloseAssign} type="button">
                Close popup
              </button>
            </div>
            <h2>ASSIGN EMERGENCY ASSISTANCE</h2>

            <div className="review-grid review-grid--two">
              <div>
                <span>Location</span>
                <strong>{assignModalGroup.village}</strong>
              </div>
              <div>
                <span>Coordinates</span>
                <strong>{assignModalGroup.position[0].toFixed(4)}, {assignModalGroup.position[1].toFixed(4)}</strong>
              </div>
              <div>
                <span>Number of People</span>
                <strong>{assignModalGroup.peopleCount}</strong>
              </div>
              <div>
                <span>Risk Level</span>
                <strong className={`severity-badge severity-badge--${assignModalGroup.riskLevel === 'CRITICAL' ? 'critical' : assignModalGroup.riskLevel === 'HIGH' ? 'high' : 'warning'}`}>
                  {emojiFor(riskLevelFor(assignModalGroup.riskLevel))} {assignModalGroup.riskLevel}
                </strong>
              </div>
            </div>

            <div className="review-details-block">
              <h3>Reason for No Safe Route</h3>
              <p>{assignModalGroup.reason}</p>
            </div>

            <div className="review-details-block">
              <h3>Available Response Teams</h3>
              <div className="uwr-team-grid">
                {responseTeams.map((team) => (
                  <label className={`uwr-team-card${assignForm.teamId === team.id ? ' is-selected' : ''}`} key={team.id}>
                    <input
                      checked={assignForm.teamId === team.id}
                      name="responseTeam"
                      onChange={() => setAssignForm((current) => ({ ...current, teamId: team.id }))}
                      type="radio"
                      value={team.id}
                    />
                    <strong>{team.name}</strong>
                    <span>{team.personnel} personnel</span>
                    <span>{team.vehicles} rescue vehicle{team.vehicles > 1 ? 's' : ''}</span>
                    {team.medicalUnits > 0 && <span>{team.medicalUnits} medical unit{team.medicalUnits > 1 ? 's' : ''}</span>}
                  </label>
                ))}
              </div>
            </div>

            <div className="review-details-block">
              <h3>Assignment Details</h3>
              <div className="uwr-form-grid">
                <label className="uwr-field">
                  <span>Vehicle</span>
                  <select
                    onChange={(event) => setAssignForm((current) => ({ ...current, vehicle: event.target.value }))}
                    value={assignForm.vehicle}
                  >
                    {vehicleOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="uwr-field">
                  <span>Evacuation Destination</span>
                  <select
                    onChange={(event) => setAssignForm((current) => ({ ...current, destinationId: event.target.value }))}
                    value={assignForm.destinationId}
                  >
                    {relocationAreas.map((area) => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </label>

                <label className="uwr-checkbox">
                  <input
                    checked={assignForm.medical}
                    onChange={(event) => setAssignForm((current) => ({ ...current, medical: event.target.checked }))}
                    type="checkbox"
                  />
                  Medical Assistance
                </label>

                <label className="uwr-checkbox">
                  <input
                    checked={assignForm.foodWater}
                    onChange={(event) => setAssignForm((current) => ({ ...current, foodWater: event.target.checked }))}
                    type="checkbox"
                  />
                  Food &amp; Water
                </label>
              </div>
            </div>

            <div className="review-decision">
              <div className="review-decision__buttons">
                <button className="review-decision__approve" type="submit">
                  <Check size={15} />
                  ASSIGN RESPONSE
                </button>
              </div>
              <div className="review-modal__footer">
                <button className="review-modal__dismiss review-modal__dismiss--footer" onClick={handleCloseAssign} type="button">
                  Close popup
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {showAllotForm && allotForm && (
        <div className="review-modal-backdrop" aria-modal="true" role="dialog">
          <form className="review-modal rcm-allot-modal" onSubmit={handleCreateCentre}>
            <button className="review-modal__close" onClick={closeAllotForm} type="button" aria-label="Close allotment form">
              <X size={16} />
            </button>
            <div className="review-modal__header">
              <p>NEW RELOCATION CENTRE</p>
              <button className="review-modal__dismiss" onClick={closeAllotForm} type="button">
                Close popup
              </button>
            </div>
            <h2>ALLOT RELOCATION CENTRE</h2>

            <div className="uwr-form-grid">
              <label className="uwr-field">
                <span>Centre Name</span>
                <input
                  onChange={(event) => updateAllotForm('name', event.target.value)}
                  required
                  type="text"
                  value={allotForm.name}
                />
              </label>

              <label className="uwr-field">
                <span>Location</span>
                <input
                  onChange={(event) => updateAllotForm('location', event.target.value)}
                  type="text"
                  value={allotForm.location}
                />
              </label>

              <label className="uwr-field">
                <span>Latitude</span>
                <input
                  onChange={(event) => updateAllotForm('latitude', event.target.value)}
                  step="any"
                  type="number"
                  value={allotForm.latitude}
                />
              </label>

              <label className="uwr-field">
                <span>Longitude</span>
                <input
                  onChange={(event) => updateAllotForm('longitude', event.target.value)}
                  step="any"
                  type="number"
                  value={allotForm.longitude}
                />
              </label>

              <label className="uwr-field">
                <span>Capacity</span>
                <input
                  min="0"
                  onChange={(event) => updateAllotForm('capacity', event.target.value)}
                  required
                  type="number"
                  value={allotForm.capacity}
                />
              </label>

              <label className="uwr-field">
                <span>Medical Beds</span>
                <input
                  min="0"
                  onChange={(event) => updateAllotForm('medicalBeds', event.target.value)}
                  type="number"
                  value={allotForm.medicalBeds}
                />
              </label>

              <label className="uwr-field">
                <span>Food Capacity</span>
                <input
                  onChange={(event) => updateAllotForm('foodCapacity', event.target.value)}
                  placeholder="e.g. 500 meals/day"
                  type="text"
                  value={allotForm.foodCapacity}
                />
              </label>

              <label className="uwr-field">
                <span>Water Capacity</span>
                <input
                  onChange={(event) => updateAllotForm('waterCapacity', event.target.value)}
                  placeholder="e.g. 5,000 L/day"
                  type="text"
                  value={allotForm.waterCapacity}
                />
              </label>

              <label className="uwr-field">
                <span>Toilets</span>
                <input
                  min="0"
                  onChange={(event) => updateAllotForm('toilets', event.target.value)}
                  type="number"
                  value={allotForm.toilets}
                />
              </label>

              <label className="uwr-field">
                <span>Emergency Contact</span>
                <input
                  onChange={(event) => updateAllotForm('emergencyContact', event.target.value)}
                  placeholder="e.g. 1070 · District Control Room"
                  type="text"
                  value={allotForm.emergencyContact}
                />
              </label>

              <label className="uwr-field">
                <span>Route Safety (%)</span>
                <input
                  max="100"
                  min="0"
                  onChange={(event) => updateAllotForm('routeSafety', event.target.value)}
                  type="number"
                  value={allotForm.routeSafety}
                />
              </label>

              <label className="uwr-field">
                <span>Distance from Affected Area (km)</span>
                <input
                  min="0"
                  onChange={(event) => updateAllotForm('distanceKm', event.target.value)}
                  step="any"
                  type="number"
                  value={allotForm.distanceKm}
                />
              </label>

              <label className="uwr-field">
                <span>Estimated Travel Time</span>
                <input
                  onChange={(event) => updateAllotForm('travelTime', event.target.value)}
                  placeholder="e.g. 45 min"
                  type="text"
                  value={allotForm.travelTime}
                />
              </label>
            </div>

            <label className="uwr-checkbox rcm-emergency-checkbox">
              <input
                checked={allotForm.emergencyActive}
                onChange={(event) => updateAllotForm('emergencyActive', event.target.checked)}
                type="checkbox"
              />
              Activate immediately as an emergency centre (skips approval queue)
            </label>

            {!allotForm.emergencyActive && (
              <p className="rcm-allot-note">This centre will be created as <strong>PENDING APPROVAL</strong> and must be reviewed before it appears as an active safe area.</p>
            )}

            <div className="review-decision">
              <div className="review-decision__buttons">
                <button className="review-decision__approve" type="submit">
                  <Check size={15} />
                  {allotForm.emergencyActive ? 'CREATE & ACTIVATE CENTRE' : 'SUBMIT FOR APPROVAL'}
                </button>
              </div>
              <div className="review-modal__footer">
                <button className="review-modal__dismiss review-modal__dismiss--footer" onClick={closeAllotForm} type="button">
                  Close popup
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {deactivateTarget && (
        <div className="review-modal-backdrop" aria-modal="true" role="dialog">
          <form className="review-modal rcm-deactivate-modal" onSubmit={handleConfirmDeactivate}>
            <button className="review-modal__close" onClick={closeDeactivateModal} type="button" aria-label="Close deactivation form">
              <X size={16} />
            </button>
            <div className="review-modal__header">
              <p>REMOVE FROM ACTIVE OPERATIONS</p>
              <button className="review-modal__dismiss" onClick={closeDeactivateModal} type="button">
                Close popup
              </button>
            </div>
            <h2>{deactivateTarget.name}</h2>
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
                  <X size={15} />
                  CONFIRM REMOVAL
                </button>
              </div>
              <div className="review-modal__footer">
                <button className="review-modal__dismiss review-modal__dismiss--footer" onClick={closeDeactivateModal} type="button">
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
    </div>
  );
}

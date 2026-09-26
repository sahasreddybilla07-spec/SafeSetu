import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Boxes, CheckCircle2, ClipboardList, Globe2, MapPinned, Megaphone, ShieldCheck, Siren, UserPlus, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ControlRoomSidebar from '../components/ControlRoomSidebar';
import { controlRoomLocations } from '../data/controlRoomLocations';
import { getHazardDemoData } from '../data/hazardDemo';
import { getRoleConfig, isGovernmentAuthenticated, hasPermission } from '../utils/rbac';
import { dispatchEmergencyHelp, getEmergencyAssistanceRequests } from '../data/emergencyAssistance';
import { getCentreOperations, updateSupplyRequestStatus } from '../data/centreOperations';

const ROLE_HEADINGS = {
  national: 'NATIONAL OPERATIONS DASHBOARD',
  state: 'STATE OPERATIONS DASHBOARD',
  district: 'DISTRICT RESPONSE DASHBOARD',
};

export default function RoleDashboard({ routeRole: propRole } = {}) {
  const navigate = useNavigate();
  const { role: routeRole } = useParams();
  const role = propRole ?? routeRole ?? localStorage.getItem('safesetu-gov-role');
  const config = getRoleConfig(role);
  const [refreshKey, setRefreshKey] = useState(0);
  const [priorityRequestId, setPriorityRequestId] = useState(null);
  const data = useMemo(() => getHazardDemoData(), [refreshKey]);
  const assistanceRequests = useMemo(() => getEmergencyAssistanceRequests(), [refreshKey]);
  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener('safesetu-emergency-assistance-updated', refresh);
    window.addEventListener('safesetu-centre-ops-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('safesetu-emergency-assistance-updated', refresh);
      window.removeEventListener('safesetu-centre-ops-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (!isGovernmentAuthenticated() || !config || localStorage.getItem('safesetu-gov-role') !== role) {
      navigate('/government/login', { replace: true });
    }
  }, [config, navigate, role]);

  const scopedLocations = useMemo(() => {
    if (role === 'national') return controlRoomLocations;
    if (role === 'state') return controlRoomLocations.filter((location) => location.state === 'Odisha');
    return controlRoomLocations.filter((location) => location.district === 'Puri District');
  }, [role]);

  const liveLocations = scopedLocations.map((location) => {
    const hazard = data.hazards.find((item) => item.id === location.hazardId);
    const areas = hazard?.relocationAreas ?? [];
    return {
      ...location,
      peoplePresent: areas.reduce((sum, area) => sum + Number(area.peoplePresent ?? 0), 0),
      available: areas.reduce((sum, area) => sum + Number(area.available ?? 0), 0),
      pending: areas.filter((area) => area.approvalStatus === 'PENDING').length,
    };
  });

  const districtSupplyRequests = useMemo(() => {
    if (role !== 'district') return [];
    return liveLocations.flatMap((location) => {
      const hazard = data.hazards.find((item) => item.id === location.hazardId);
      return (hazard?.relocationAreas ?? []).flatMap((area) => (getCentreOperations(area).requestLog ?? [])
        .filter((request) => request.type === 'DISTRICT SUPPLY REQUEST')
        .map((request) => ({ ...request, centreId: area.id, centreName: area.name, location: location.location })));
    });
  }, [data, liveLocations, role]);

  if (!config) return null;

  const totalRisk = liveLocations.reduce((sum, location) => sum + location.peopleAtRisk, 0);
  const totalPresent = liveLocations.reduce((sum, location) => sum + location.peoplePresent, 0);
  const totalPending = liveLocations.reduce((sum, location) => sum + location.pending, 0);

  const actions = [
    { permission: 'assign-officers', title: 'Assign field officers', description: 'Place field officers into response zones and update their duties.', icon: UserPlus, path: '/government/control-room/officers' },
    { permission: 'manage-resources', title: 'Allocate supplies', description: 'Open centre resources and add stock where local teams need it.', icon: Boxes, path: '/government/control-room/resources' },
    { permission: 'review-centres', title: 'Review relocation centres', description: 'Review approved, pending, and rejected safe routes.', icon: ClipboardList, path: '/government/control-room/relocation-centres' },
    { permission: 'manage-routes', title: 'Coordinate unsafe routes', description: 'Assign response teams to people without a safe route.', icon: MapPinned, path: '/government/control-room/unsafe-routes' },
    { permission: 'send-alerts', title: 'Send an official alert', description: 'Communicate verified instructions to affected audiences.', icon: Megaphone, path: '/government/control-room/communication' },
    { permission: 'view-history', title: 'Review incident history', description: 'Inspect completed and previously monitored hazards.', icon: ShieldCheck, path: '/government/control-room/incident-history' },
  ].filter((action) => hasPermission(action.permission, role));

  function handleSupplyRequestStatus(request, status) {
    updateSupplyRequestStatus(request.centreId, request.time, status);
    setRefreshKey((value) => value + 1);
  }

  function handleDispatchHelp(request, priority) {
    dispatchEmergencyHelp(request.id, priority);
    setPriorityRequestId(null);
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className="crs-layout">
      <ControlRoomSidebar active="overview" role={role} />
      <main className="crs-main cr-role-dashboard">
        <header className="cr-role-dashboard__header">
          <div><p className="cr-overview__eyebrow">SAHAS · {config.scopeLabel.toUpperCase()}</p><h1>{ROLE_HEADINGS[role]}</h1><p>{config.description}</p></div>
          <span className="cr-role-dashboard__badge"><Globe2 size={15} /> {config.label}</span>
        </header>

        <section className="cr-role-dashboard__summary" aria-label="Role dashboard summary">
          <article><span>Hazard locations</span><strong>{liveLocations.length}</strong><small>{config.scopeLabel}</small></article>
          <article><span>People at risk</span><strong>{totalRisk.toLocaleString('en-IN')}</strong><small>Current monitored exposure</small></article>
          <article><span>People present</span><strong>{totalPresent.toLocaleString('en-IN')}</strong><small>Shared live occupancy data</small></article>
          <article><span>Reviews pending</span><strong>{totalPending}</strong><small>Relocation decisions awaiting review</small></article>
        </section>

        {assistanceRequests.length > 0 && <section className="cr-assistance-alert" aria-live="polite"><Siren size={20} /><div><strong>Emergency assistance requested</strong><span>{assistanceRequests.filter((request) => request.status === 'NEW' || request.status === 'REPORT_RECEIVED').length} person(s) have notified officials that no safe escape route is available.</span></div><button onClick={() => navigate('/government/control-room/unsafe-routes')} type="button">Open response view <ArrowRight size={14} /></button></section>}

        {assistanceRequests.filter((request) => request.report).map((request) => <section className="cr-situation-report" key={request.id}><div className="cr-situation-report__heading"><div><p>INCOMING SITUATION REPORT</p><h2>{request.hazard}</h2><span>{request.location} · {new Date(request.report.submittedAt).toLocaleString('en-IN')}</span></div><span className="cr-situation-report__status">{request.status.replaceAll('_', ' ')}</span></div>{request.report.text && <p className="cr-situation-report__text">{request.report.text}</p>}<div className="cr-situation-report__media">{request.report.image && <figure><img alt="Reported situation" src={request.report.image.data} /><figcaption>{request.report.image.name}</figcaption></figure>}{request.report.audio && <div><span>Audio evidence</span><audio controls src={request.report.audio.data}>Your browser cannot play this audio.</audio></div>}{request.report.video && <div><span>Video evidence</span><video controls src={request.report.video.data}>Your browser cannot play this video.</video></div>}</div><div className="cr-situation-report__actions"><button onClick={() => setPriorityRequestId((currentId) => currentId === request.id ? null : request.id)} type="button"><Siren size={14} /> Send help to this area</button>{priorityRequestId === request.id && <div className="cr-situation-report__priority"><span>Select response priority</span>{['HIGH', 'MEDIUM', 'LOW'].map((priority) => <button className={`cr-situation-report__priority-button cr-situation-report__priority-button--${priority.toLowerCase()}`} key={priority} onClick={() => handleDispatchHelp(request, priority)} type="button">{priority} PRIORITY</button>)}</div>}</div></section>)}

        {role === 'district' && <section className="cr-role-dashboard__section cr-district-requests"><div className="cr-role-dashboard__section-heading"><div><p>DISTRICT OPERATIONS INBOX</p><h2>Supply requests from field officers</h2></div><span>{districtSupplyRequests.filter((request) => request.status === 'REQUESTED').length} pending</span></div>{districtSupplyRequests.length === 0 ? <p className="empty-state">No supply requests have been submitted.</p> : <div className="cr-district-requests__list">{districtSupplyRequests.map((request) => <article key={`${request.centreId}-${request.time}`}><div><span className={`cr-request-status cr-request-status--${request.status.toLowerCase()}`}>{request.status}</span><h3>{request.quantity} {request.item}</h3><p>{request.centreName} · {request.location}{request.note ? ` · ${request.note}` : ''}</p><small>{new Date(request.time).toLocaleString('en-IN')}</small></div>{request.status === 'REQUESTED' && <div className="cr-district-requests__actions"><button onClick={() => handleSupplyRequestStatus(request, 'FULFILLED')} type="button"><CheckCircle2 size={14} /> Fulfill</button><button onClick={() => handleSupplyRequestStatus(request, 'DECLINED')} type="button"><XCircle size={14} /> Decline</button></div>}</article>)}</div>}</section>}

        <section className="cr-role-dashboard__section"><div className="cr-role-dashboard__section-heading"><div><p>LIVE SCOPE</p><h2>{role === 'national' ? 'India-wide hazard monitoring' : role === 'state' ? 'State hazard coordination' : 'District response picture'}</h2></div></div><div className="cr-role-dashboard__locations">{liveLocations.map((location) => <article key={location.hazardId}><div><span>{location.hazardType}</span><h3>{location.location}</h3><p>{location.district} · {location.severity} priority</p></div><strong>{location.available.toLocaleString('en-IN')}<small> spaces free</small></strong><button onClick={() => navigate(`/government/control-room/hazard/${location.hazardId}`)} type="button">Open response view <ArrowRight size={14} /></button></article>)}</div></section>

        <section className="cr-role-dashboard__section"><div className="cr-role-dashboard__section-heading"><div><p>AUTHORISED DUTIES</p><h2>Actions available to this role</h2></div></div><div className="cr-role-dashboard__actions">{actions.map(({ title, description, icon: Icon, path }) => <button key={title} onClick={() => navigate(path)} type="button"><Icon size={19} /><span><strong>{title}</strong><small>{description}</small></span><ArrowRight size={15} /></button>)}</div></section>
      </main>
    </div>
  );
}

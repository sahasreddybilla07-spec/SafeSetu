import { useMemo } from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import ControlRoomSidebar from '../components/ControlRoomSidebar';
import { controlRoomLocations } from '../data/controlRoomLocations';
import { getUnsafeRouteGroups } from '../data/unsafeRouteGroups';

export default function ControlRoomUnsafeRoutes() {
  const groups = useMemo(() => controlRoomLocations.flatMap((location) => getUnsafeRouteGroups(location.hazardId).map((group) => ({ ...group, hazard: location.location, hazardId: location.hazardId }))), []);
  return <div className="crs-layout"><ControlRoomSidebar active="unsafe" /><main className="crs-main cr-data-page"><header className="cr-data-page__header"><div><p className="cr-overview__eyebrow">RESPONSE PRIORITY</p><h1>PEOPLE WITHOUT SAFE ROUTES</h1><p>Review communities that need a response assignment before evacuation can begin.</p></div></header><section className="cr-unsafe-list">{groups.map((group) => <article className="cr-unsafe-item" key={group.id}><span className={`cr-unsafe-item__risk cr-unsafe-item__risk--${group.riskLevel.toLowerCase()}`}><AlertTriangle size={14} /> {group.riskLevel}</span><div><h2>{group.village}</h2><p><MapPin size={13} /> {group.hazard} · {group.reason}</p></div><strong>{group.peopleCount} people</strong><button onClick={() => window.location.assign(`/government/control-room/hazard/${group.hazardId}`)} type="button">Open response centre</button></article>)}</section></main></div>;
}
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, MapPin, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ControlRoomSidebar from '../components/ControlRoomSidebar';
import { controlRoomLocations } from '../data/controlRoomLocations';
import { getHazardDemoData } from '../data/hazardDemo';

const statusGroups = [
  { key: 'APPROVED', label: 'Accepted safe routes', icon: CheckCircle2 },
  { key: 'PENDING', label: 'Waiting for review', icon: Clock3 },
  { key: 'REJECTED', label: 'Rejected routes', icon: XCircle },
];

export default function ControlRoomRelocationCentres() {
  const navigate = useNavigate();
  const [selectedHazardId, setSelectedHazardId] = useState(null);
  const hazards = useMemo(() => {
    const demoData = getHazardDemoData();
    return controlRoomLocations.map((location) => ({
      ...location,
      hazard: demoData.hazards.find((item) => item.id === location.hazardId),
    }));
  }, []);
  const selected = hazards.find((item) => item.hazardId === selectedHazardId) ?? null;

  return (
    <div className="crs-layout">
      <ControlRoomSidebar active="centres" />
      <main className="crs-main cr-data-page">
        <header className="cr-data-page__header">
          <div><p className="cr-overview__eyebrow">OPERATIONS DIRECTORY</p><h1>RELOCATION CENTRES</h1><p>Select an active hazard to review every available safe route and its approval state.</p></div>
          {selected && <button className="control-room-secondary-button" onClick={() => setSelectedHazardId(null)} type="button"><ArrowLeft size={14} /> All hazards</button>}
        </header>
        {!selected ? (
          <section className="cr-data-grid" aria-label="Active hazards">
            {hazards.map((item) => <button className="cr-data-card cr-data-card--button" key={item.hazardId} onClick={() => setSelectedHazardId(item.hazardId)} type="button">
              <div className="cr-data-card__eyebrow"><MapPin size={14} /> {item.severity}</div>
              <h2>{item.location}</h2><p>{item.hazardType} · {item.district}</p>
              <strong>{item.hazard?.relocationAreas.length ?? 0} safe routes registered</strong><span>View route approvals →</span>
            </button>)}
          </section>
        ) : (
          <section className="cr-detail-page">
            <div className="cr-detail-page__intro"><div><p className="cr-overview__eyebrow">ACTIVE HAZARD</p><h2>{selected.location}</h2><p>{selected.hazardType} · {selected.district}</p></div><span className={`severity-badge severity-badge--${selected.severity.toLowerCase()}`}>{selected.severity}</span></div>
            {statusGroups.map(({ key, label, icon: Icon }) => <section className="cr-route-group" key={key}><div className="cr-route-group__heading"><h3><Icon size={16} /> {label}</h3><span>{selected.hazard?.relocationAreas.filter((area) => area.approvalStatus === key).length ?? 0}</span></div><div className="cr-route-list">{selected.hazard?.relocationAreas.filter((area) => area.approvalStatus === key).map((area) => <article className="cr-route-item" key={area.id}><div><h4>{area.name}</h4><p>{area.address} · {area.distance} km · {area.travelTime}</p></div><strong>{area.available.toLocaleString('en-IN')} spaces</strong></article>)}{selected.hazard?.relocationAreas.filter((area) => area.approvalStatus === key).length === 0 && <p className="empty-state">No routes in this category.</p>}</div></section>)}
          </section>
        )}
      </main>
    </div>
  );
}
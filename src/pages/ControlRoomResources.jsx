import { useEffect, useMemo, useState } from 'react';
import { Boxes, MapPin } from 'lucide-react';
import ControlRoomSidebar from '../components/ControlRoomSidebar';
import { controlRoomLocations } from '../data/controlRoomLocations';
import { getHazardDemoData } from '../data/hazardDemo';
import { addResourceStock, getCentreOperations } from '../data/centreOperations';
import { getCurrentGovernmentRole, hasPermission } from '../utils/rbac';

export default function ControlRoomResources() {
  const [refreshKey, setRefreshKey] = useState(0);
  const role = getCurrentGovernmentRole();
  const canManage = hasPermission('manage-resources', role);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener('safesetu-centre-ops-updated', refresh);
    return () => window.removeEventListener('safesetu-centre-ops-updated', refresh);
  }, []);

  const centres = useMemo(() => {
    const data = getHazardDemoData();
    return controlRoomLocations.flatMap((location) => {
      const hazard = data.hazards.find((item) => item.id === location.hazardId);
      return (hazard?.relocationAreas ?? []).filter((area) => area.approvalStatus === 'APPROVED').map((area) => ({ ...area, location: location.location, operations: getCentreOperations(area) }));
    });
  }, [refreshKey]);

  function addSupply(centreId, resourceKey) {
    addResourceStock(centreId, resourceKey, 100);
    setRefreshKey((value) => value + 1);
  }
  const requests = centres.flatMap((centre) => (centre.operations.requestLog ?? []).map((request) => ({ ...request, centreName: centre.name })));
  return <div className="crs-layout"><ControlRoomSidebar active="resources" /><main className="crs-main cr-data-page"><header className="cr-data-page__header"><div><p className="cr-overview__eyebrow">SUPPLY READINESS</p><h1>RESOURCES</h1><p>Monitor stock, medical capacity and essential supplies at approved relocation centres.</p></div></header>{requests.length > 0 && <section className="cr-resource-requests"><h2>Requests from field officers</h2>{requests.map((request, index) => <div key={`${request.time}-${index}`}><strong>{request.quantity} {request.item}</strong><span>{request.centreName}{request.note ? ` · ${request.note}` : ''}</span><em>{request.status ?? 'REQUESTED'}</em></div>)}</section>}<section className="cr-resource-grid">{centres.map((centre) => <article className="cr-resource-card" key={centre.id}><div className="cr-resource-card__heading"><div><h2>{centre.name}</h2><p><MapPin size={13} /> {centre.location}</p></div><Boxes size={20} /></div><div className="cr-resource-card__metrics"><div><span>Medical beds</span><strong>{centre.operations.medical.occupiedBeds}/{centre.operations.medical.totalBeds}</strong></div><div><span>Food coverage</span><strong>{Math.round(centre.operations.food.availableStock / Math.max(1, (centre.peoplePresent || 100) * 3))} days</strong></div><div><span>Water coverage</span><strong>{Math.round(centre.operations.water.availableStock / Math.max(1, (centre.peoplePresent || 100) * 12))} days</strong></div></div><div className="cr-resource-list">{centre.operations.resources.slice(0, 4).map((resource) => <div key={resource.key}><span>{resource.label}</span><strong className={`resource-status--${resource.status.toLowerCase()}`}>{resource.available} / {resource.required}</strong>{canManage && <button className="cr-resource-add" onClick={() => addSupply(centre.id, resource.key)} type="button">+100</button>}</div>)}</div>{canManage && <p className="cr-resource-card__permission">District action: add supply stock directly to this centre.</p>}</article>)}</section></main></div>;
}
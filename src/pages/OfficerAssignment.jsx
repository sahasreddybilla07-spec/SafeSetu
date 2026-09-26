import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ControlRoomSidebar from '../components/ControlRoomSidebar';
import { controlRoomLocations } from '../data/controlRoomLocations';
import {
  assignOfficer,
  assignmentTypes,
  durationOptions,
  getAssignments,
  getOfficerById,
  officers,
  removeAssignment,
} from '../data/officerAssignments';

export default function OfficerAssignment() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedHazardId, setSelectedHazardId] = useState(controlRoomLocations[0]?.hazardId ?? '');
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (localStorage.getItem('safesetu-gov-auth') !== 'true') {
      navigate('/government/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleStateUpdate = () => setRefreshKey((value) => value + 1);
    window.addEventListener('safesetu-officer-assignments-updated', handleStateUpdate);
    window.addEventListener('storage', handleStateUpdate);
    return () => {
      window.removeEventListener('safesetu-officer-assignments-updated', handleStateUpdate);
      window.removeEventListener('storage', handleStateUpdate);
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const selectedLocation = controlRoomLocations.find((location) => location.hazardId === selectedHazardId) ?? null;
  const zones = useMemo(() => getAssignments(selectedHazardId), [selectedHazardId, refreshKey]);
  const selectedZone = zones.find((zone) => zone.zoneId === selectedZoneId) ?? zones[0] ?? null;

  function openAssignModal(zone) {
    if (!zone) return;
    setAssignForm({
      hazardId: selectedHazardId,
      zoneId: zone.zoneId,
      officerId: zone.officerId ?? officers[0].id,
      assignmentType: zone.assignmentType ?? assignmentTypes[0],
      duration: zone.duration ?? durationOptions[0],
    });
    setShowAssignModal(true);
  }

  function closeAssignModal() {
    setShowAssignModal(false);
    setAssignForm(null);
  }

  function handleAssignSubmit(event) {
    event.preventDefault();
    if (!assignForm) return;

    assignOfficer(assignForm.hazardId, assignForm.zoneId, {
      officerId: assignForm.officerId,
      assignmentType: assignForm.assignmentType,
      duration: assignForm.duration,
    });

    const officer = getOfficerById(assignForm.officerId);
    setNotice(`${officer?.name ?? 'Officer'} assigned successfully.`);
    setSelectedZoneId(assignForm.zoneId);
    closeAssignModal();
    setRefreshKey((value) => value + 1);
  }

  function handleRemove(zoneId) {
    removeAssignment(selectedHazardId, zoneId);
    setNotice('Assignment removed. Zone now needs an officer.');
    setRefreshKey((value) => value + 1);
  }

  function selectHazardZone(zoneId) {
    setSelectedZoneId(zoneId);
  }

  return (
    <div className="crs-layout">
      <ControlRoomSidebar active="officers" />

      <main className="crs-main">
        <header className="crs-main__header">
          <div>
            <p className="lcc-eyebrow">SAHAS · CONTROL ROOM</p>
            <h1>FIELD OFFICER ASSIGNMENT</h1>
          </div>
          <label className="oa-location-select">
            <span>Disaster Location</span>
            <select
              onChange={(event) => {
                setSelectedHazardId(event.target.value);
                setSelectedZoneId(null);
              }}
              value={selectedHazardId}
            >
              {controlRoomLocations.map((location) => (
                <option key={location.hazardId} value={location.hazardId}>{location.location}</option>
              ))}
            </select>
          </label>
        </header>

        <div className="oa-grid">
          <section className="lcc-panel oa-table-panel">
            <div className="lcc-panel__heading oa-table-panel__heading">
              <div>
                <p>ZONE ASSIGNMENTS</p>
                <h3>{selectedLocation?.location}</h3>
              </div>
              <label className="oa-zone-select">
                <span>Hazard Zone</span>
                <select onChange={(event) => selectHazardZone(event.target.value)} value={selectedZone?.zoneId ?? ''}>
                  {zones.map((zone) => (
                    <option key={zone.zoneId} value={zone.zoneId}>{zone.zoneLabel}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="uwr-table-wrap">
              <table className="uwr-table oa-table">
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Field Officer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => {
                    const officer = zone.officerId ? getOfficerById(zone.officerId) : null;
                    return (
                      <tr
                        className={selectedZoneId === zone.zoneId ? 'is-selected' : ''}
                        key={zone.zoneId}
                        onClick={() => setSelectedZoneId(zone.zoneId)}
                      >
                        <td>{zone.zoneLabel}</td>
                        <td>{officer ? officer.name : 'Unassigned'}</td>
                        <td>
                          <span className={`uwr-status uwr-status--${zone.status === 'ASSIGNED' ? 'assigned' : 'unassigned'}`}>
                            {zone.status === 'ASSIGNED' ? '🟢' : '🔴'} {zone.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="oa-selected-zone">
              <div>
                <span>Selected hazard zone</span>
                <strong>{selectedZone?.zoneLabel ?? 'No hazard zones available'}</strong>
              </div>
              <div className="uwr-actions">
                <button className="rcm-allot-button oa-assign-button" disabled={!selectedZone} onClick={() => openAssignModal(selectedZone)} type="button">
                  <Plus size={15} /> {selectedZone?.status === 'ASSIGNED' ? 'REASSIGN OFFICER' : 'ASSIGN OFFICER'}
                </button>
                {selectedZone?.status === 'ASSIGNED' && (
                  <button className="rcm-action-danger" onClick={() => handleRemove(selectedZone.zoneId)} type="button">
                    REMOVE ASSIGNMENT
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {showAssignModal && assignForm && (
        <div className="review-modal-backdrop" aria-modal="true" role="dialog">
          <form className="review-modal" onSubmit={handleAssignSubmit}>
            <button className="review-modal__close" onClick={closeAssignModal} type="button" aria-label="Close assignment form">
              <X size={16} />
            </button>
            <div className="review-modal__header">
              <p>OFFICER ASSIGNMENT</p>
              <button className="review-modal__dismiss" onClick={closeAssignModal} type="button">Close popup</button>
            </div>
            <h2>ASSIGN FIELD OFFICER</h2>

            <div className="uwr-form-grid">
              <label className="uwr-field">
                <span>Select Officer</span>
                <select
                  onChange={(event) => setAssignForm((current) => ({ ...current, officerId: event.target.value }))}
                  value={assignForm.officerId}
                >
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>{officer.name}</option>
                  ))}
                </select>
              </label>

              <label className="uwr-field">
                <span>Assignment</span>
                <select
                  onChange={(event) => setAssignForm((current) => ({ ...current, assignmentType: event.target.value }))}
                  value={assignForm.assignmentType}
                >
                  {assignmentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="uwr-field">
                <span>Duration</span>
                <select
                  onChange={(event) => setAssignForm((current) => ({ ...current, duration: event.target.value }))}
                  value={assignForm.duration}
                >
                  {durationOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="review-decision">
              <div className="review-decision__buttons">
                <button className="review-decision__approve" type="submit">
                  <Check size={15} /> ASSIGN OFFICER
                </button>
              </div>
              <div className="review-modal__footer">
                <button className="review-modal__dismiss review-modal__dismiss--footer" onClick={closeAssignModal} type="button">
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

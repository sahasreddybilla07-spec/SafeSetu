import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, UserCog, X } from 'lucide-react';
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
  const selectedZone = zones.find((zone) => zone.zoneId === selectedZoneId) ?? null;
  const selectedOfficer = selectedZone?.officerId ? getOfficerById(selectedZone.officerId) : null;

  function openAssignModal(zone) {
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

  return (
    <div className="crs-layout">
      <ControlRoomSidebar active="officers" />

      <main className="crs-main">
        <header className="crs-main__header">
          <div>
            <p className="lcc-eyebrow">SAFESETU · CONTROL ROOM</p>
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
            </div>

            <div className="uwr-table-wrap">
              <table className="uwr-table oa-table">
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Field Officer</th>
                    <th>Status</th>
                    <th>Action</th>
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
                        <td onClick={(event) => event.stopPropagation()}>
                          <div className="uwr-actions">
                            <button className="uwr-action-secondary" onClick={() => openAssignModal(zone)} type="button">
                              {zone.status === 'ASSIGNED' ? 'REASSIGN' : 'ASSIGN'}
                            </button>
                            {zone.status === 'ASSIGNED' && (
                              <button className="rcm-action-danger" onClick={() => handleRemove(zone.zoneId)} type="button">
                                REMOVE
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              className="rcm-allot-button oa-assign-button"
              onClick={() => openAssignModal({ zoneId: zones[0]?.zoneId, officerId: null, assignmentType: null, duration: null })}
              type="button"
            >
              <Plus size={15} /> ASSIGN OFFICER
            </button>
          </section>

          <section className="lcc-panel oa-details-panel">
            <div className="lcc-panel__heading">
              <p>FIELD OFFICER</p>
              <h3>Officer details</h3>
            </div>

            {selectedZone && selectedOfficer ? (
              <div className="oa-officer-card">
                <div className="oa-officer-card__avatar"><UserCog size={22} /></div>
                <h4>{selectedOfficer.name}</h4>
                <dl>
                  <div><dt>Officer ID</dt><dd>{selectedOfficer.id.toUpperCase()}</dd></div>
                  <div><dt>Current Zone</dt><dd>{selectedZone.zoneLabel}</dd></div>
                  <div><dt>Disaster</dt><dd>{selectedLocation?.location}</dd></div>
                  <div><dt>Role</dt><dd>{selectedZone.assignmentType}</dd></div>
                  <div><dt>Status</dt><dd>🟢 ACTIVE</dd></div>
                  <div><dt>Contact</dt><dd>{selectedOfficer.contact}</dd></div>
                  <div><dt>Last Updated</dt><dd>{selectedZone.lastUpdated ? new Date(selectedZone.lastUpdated).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'Just now'}</dd></div>
                  <div><dt>Current Task</dt><dd>{selectedZone.currentTask}</dd></div>
                </dl>
              </div>
            ) : (
              <div className="empty-state">Select an assigned zone to view field officer details.</div>
            )}
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
                <span>Select Disaster Location</span>
                <select
                  onChange={(event) => {
                    const hazardId = event.target.value;
                    const nextZones = getAssignments(hazardId);
                    setAssignForm((current) => ({ ...current, hazardId, zoneId: nextZones[0]?.zoneId ?? '' }));
                  }}
                  value={assignForm.hazardId}
                >
                  {controlRoomLocations.map((location) => (
                    <option key={location.hazardId} value={location.hazardId}>{location.location}</option>
                  ))}
                </select>
              </label>

              <label className="uwr-field">
                <span>Select Zone</span>
                <select
                  onChange={(event) => setAssignForm((current) => ({ ...current, zoneId: event.target.value }))}
                  value={assignForm.zoneId}
                >
                  {getAssignments(assignForm.hazardId).map((zone) => (
                    <option key={zone.zoneId} value={zone.zoneId}>{zone.zoneLabel}</option>
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

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, CheckCircle2, LogOut, MapPinned, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { applyFieldOfficerUpdate, getHazardDemoData } from '../data/hazardDemo';

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

export default function FieldOfficerDashboard() {
  const navigate = useNavigate();
  const [demoData, setDemoData] = useState(() => getHazardDemoData());
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [formState, setFormState] = useState({ capacity: '', peoplePresent: '' });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!demoData.relocationAreas?.length) {
      return;
    }

    if (!selectedAreaId || !demoData.relocationAreas.some((area) => area.id === selectedAreaId)) {
      setSelectedAreaId(demoData.relocationAreas[0].id);
    }
  }, [demoData, selectedAreaId]);

  const selectedArea = useMemo(
    () => demoData.relocationAreas.find((area) => area.id === selectedAreaId) ?? demoData.relocationAreas[0] ?? null,
    [demoData, selectedAreaId],
  );

  useEffect(() => {
    if (!selectedArea) {
      return;
    }

    setFormState({
      capacity: String(selectedArea.capacity ?? 0),
      peoplePresent: String(selectedArea.peoplePresent ?? selectedArea.available ?? 0),
    });
    setNotice('');
  }, [selectedArea]);

  function handleLogout() {
    localStorage.removeItem('safesetu-field-officer-auth');
    localStorage.removeItem('safesetu-field-officer-name');
    navigate('/login', { replace: true });
  }

  function handleFieldUpdate(event) {
    event.preventDefault();

    if (!selectedArea) {
      return;
    }

    const capacity = Number(formState.capacity);
    const peoplePresent = Number(formState.peoplePresent);

    if (!Number.isFinite(capacity) || !Number.isFinite(peoplePresent) || capacity < 0 || peoplePresent < 0) {
      setNotice('Please enter valid numbers for capacity and people currently present.');
      return;
    }

    if (peoplePresent > capacity) {
      setNotice('People currently present cannot exceed total capacity.');
      return;
    }

    const nextData = applyFieldOfficerUpdate(selectedArea.id, {
      capacity,
      peoplePresent,
    });

    setDemoData(nextData);
    setNotice(`Updated ${selectedArea.name}. Government dashboard has been refreshed with the new occupancy.`);
  }

  const totalPeoplePresent = demoData.relocationAreas.reduce(
    (total, area) => total + Number(area.peoplePresent ?? area.occupancy ?? 0),
    0,
  );
  const avgOccupancy = demoData.relocationAreas.length
    ? Math.round(
        demoData.relocationAreas.reduce((total, area) => total + Number(area.occupancy ?? area.occupancyPercent ?? 0), 0) /
          demoData.relocationAreas.length,
      )
    : 0;

  return (
    <div className="field-officer-dashboard">
      <header className="field-officer-dashboard__header">
        <div className="field-officer-dashboard__brand">
          <img alt="" aria-hidden="true" className="navbar__mark" src="/safesetu-crest.png" />
          <div>
            <p className="control-room-eyebrow">SAFESETU</p>
            <h1>Field Officer Occupancy Dashboard</h1>
          </div>
        </div>
        <div className="field-officer-dashboard__header-actions">
          <button className="dashboard-panel__button" onClick={() => navigate(-1)} type="button">BACK</button>
          <Link className="dashboard-panel__button" to="/">HOME</Link>
          <button className="dashboard-panel__button" onClick={handleLogout} type="button">
            <LogOut size={14} />
            LOGOUT
          </button>
          <span className="field-officer-dashboard__last-updated">Updated: {demoData.lastUpdated}</span>
        </div>
      </header>

      <section className="stats-grid field-officer-dashboard__stats" aria-label="Field officer summary stats">
        <article className="stat-card stat-card--neutral">
          <div className="stat-card__heading">
            <span>Sites tracked</span>
            <span className="stat-card__icon"><MapPinned size={18} /></span>
          </div>
          <strong>{demoData.relocationAreas.length}</strong>
          <p>Relocation locations being monitored</p>
        </article>
        <article className="stat-card stat-card--critical">
          <div className="stat-card__heading">
            <span>People present</span>
            <span className="stat-card__icon"><Users size={18} /></span>
          </div>
          <strong>{formatNumber(totalPeoplePresent)}</strong>
          <p>Counted at monitored shelters</p>
        </article>
        <article className="stat-card stat-card--safe">
          <div className="stat-card__heading">
            <span>Average occupancy</span>
            <span className="stat-card__icon"><ShieldCheck size={18} /></span>
          </div>
          <strong>{avgOccupancy}%</strong>
          <p>Across all tracked sites</p>
        </article>
        <article className="stat-card stat-card--warning">
          <div className="stat-card__heading">
            <span>Last sync</span>
            <span className="stat-card__icon"><RefreshCw size={18} /></span>
          </div>
          <strong>{demoData.lastUpdated}</strong>
          <p>Shared with the government dashboard</p>
        </article>
      </section>

      <section className="field-officer-dashboard__layout">
        <aside className="field-officer-dashboard__list">
          <div className="dashboard-panel__heading">
            <div><p>Active sites</p><h2>Monitored Shelters</h2></div>
          </div>

          {demoData.relocationAreas.map((area) => {
            const isSelected = area.id === selectedAreaId;
            return (
              <button
                className={`field-officer-dashboard__site${isSelected ? ' is-selected' : ''}`}
                key={area.id}
                onClick={() => setSelectedAreaId(area.id)}
                type="button"
              >
                <div className="field-officer-dashboard__site-header">
                  <span>{area.name}</span>
                  <strong>{area.occupancy ?? 0}%</strong>
                </div>
                <p>{formatNumber(area.peoplePresent ?? 0)} people present · {formatNumber(area.available ?? 0)} spaces free</p>
              </button>
            );
          })}
        </aside>

        <main className="field-officer-dashboard__panel dashboard-panel">
          {selectedArea ? (
            <>
              <div className="dashboard-panel__heading">
                <div><p>Site update</p><h2>{selectedArea.name}</h2></div>
                <span className="field-officer-dashboard__badge">LIVE</span>
              </div>

              <div className="field-officer-dashboard__meta">
                <div>
                  <span>Capacity</span>
                  <strong>{formatNumber(selectedArea.capacity)} people</strong>
                </div>
                <div>
                  <span>Current occupancy</span>
                  <strong>{selectedArea.occupancy ?? 0}%</strong>
                </div>
                <div>
                  <span>Available spaces</span>
                  <strong>{formatNumber(selectedArea.available ?? 0)}</strong>
                </div>
              </div>

              <form className="field-officer-dashboard__form" onSubmit={handleFieldUpdate}>
                <label>
                  Total capacity
                  <input
                    min="0"
                    onChange={(event) => setFormState((current) => ({ ...current, capacity: event.target.value }))}
                    placeholder="Enter capacity"
                    type="number"
                    value={formState.capacity}
                  />
                </label>

                <label>
                  People currently present
                  <input
                    min="0"
                    onChange={(event) => setFormState((current) => ({ ...current, peoplePresent: event.target.value }))}
                    placeholder="Enter count"
                    type="number"
                    value={formState.peoplePresent}
                  />
                </label>

                <button className="dashboard-panel__button dashboard-panel__button--primary" type="submit">
                  <CheckCircle2 size={16} />
                  Update occupancy
                </button>
              </form>

              {notice && <p className="field-officer-dashboard__notice">{notice}</p>}
            </>
          ) : (
            <p className="field-officer-dashboard__empty">No monitored site selected.</p>
          )}
        </main>
      </section>
    </div>
  );
}

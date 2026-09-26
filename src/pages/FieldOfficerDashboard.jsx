import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Droplets, LogOut, MapPinned, PackagePlus, RefreshCw, ShieldCheck, Truck, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { applyFieldOfficerUpdate, getHazardDemoData } from '../data/hazardDemo';
import { getCentreOperations, requestCentreSupplies, updateCentreInventory } from '../data/centreOperations';

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

export default function FieldOfficerDashboard() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [formState, setFormState] = useState({ capacity: '', peoplePresent: '' });
  const [inventoryState, setInventoryState] = useState({ totalBeds: '', occupiedBeds: '', emergencyKits: '', medicalKitsResource: '', oxygenTanks: '', fuel: '', food: '', water: '' });
  const [supplyRequest, setSupplyRequest] = useState({ item: 'Food', quantity: '', note: '' });
  const [notice, setNotice] = useState('');
  const demoData = useMemo(() => getHazardDemoData(), [refreshKey]);

  useEffect(() => {
    const refreshData = () => setRefreshKey((value) => value + 1);
    window.addEventListener('safesetu-hazard-demo-updated', refreshData);
    window.addEventListener('storage', refreshData);

    return () => {
      window.removeEventListener('safesetu-hazard-demo-updated', refreshData);
      window.removeEventListener('storage', refreshData);
    };
  }, []);

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
  const operations = useMemo(() => selectedArea ? getCentreOperations(selectedArea) : null, [selectedArea, refreshKey]);

  useEffect(() => {
    if (!selectedArea) {
      return;
    }

    setFormState({
      capacity: String(selectedArea.capacity ?? 0),
      peoplePresent: String(selectedArea.peoplePresent ?? selectedArea.available ?? 0),
    });
    const currentOperations = getCentreOperations(selectedArea);
    setInventoryState({
      totalBeds: String(currentOperations.medical.totalBeds),
      occupiedBeds: String(currentOperations.medical.occupiedBeds),
      emergencyKits: String(currentOperations.resources.find((item) => item.key === 'emergencyKits')?.available ?? 0),
      medicalKitsResource: String(currentOperations.resources.find((item) => item.key === 'medicalKitsResource')?.available ?? 0),
      oxygenTanks: String(currentOperations.resources.find((item) => item.key === 'oxygenTanks')?.available ?? 0),
      fuel: String(currentOperations.resources.find((item) => item.key === 'fuel')?.available ?? 0),
      food: String(currentOperations.food.availableStock),
      water: String(currentOperations.water.availableStock),
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

    applyFieldOfficerUpdate(selectedArea.id, {
      capacity,
      peoplePresent,
    });

    setRefreshKey((value) => value + 1);
    setNotice(`Updated ${selectedArea.name}. Government dashboard has been refreshed with the new occupancy.`);
  }

  function handleInventoryUpdate(event) {
    event.preventDefault();
    if (!selectedArea) return;
    const values = Object.fromEntries(Object.entries(inventoryState).map(([key, value]) => [key, Number(value)]));
    if (Object.values(values).some((value) => !Number.isFinite(value) || value < 0)) {
      setNotice('Enter valid non-negative numbers for all stock and bed counts.');
      return;
    }
    if (values.occupiedBeds > values.totalBeds) {
      setNotice('Occupied beds cannot exceed total beds.');
      return;
    }
    updateCentreInventory(selectedArea.id, values);
    setRefreshKey((value) => value + 1);
    setNotice(`Updated supplies and bed availability for ${selectedArea.name}.`);
  }

  function handleSupplyRequest(event) {
    event.preventDefault();
    if (!selectedArea || !supplyRequest.quantity || Number(supplyRequest.quantity) <= 0) {
      setNotice('Enter a supply quantity before requesting district support.');
      return;
    }
    requestCentreSupplies(selectedArea.id, { item: supplyRequest.item, quantity: Number(supplyRequest.quantity), note: supplyRequest.note.trim() });
    setSupplyRequest((current) => ({ ...current, quantity: '', note: '' }));
    setRefreshKey((value) => value + 1);
    setNotice(`District officer notified: ${supplyRequest.quantity} ${supplyRequest.item} requested.`);
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
            <p className="control-room-eyebrow">SAHAS</p>
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

              <form className="field-officer-dashboard__inventory" onSubmit={handleInventoryUpdate}>
                <div className="dashboard-panel__heading"><div><p>Operational inventory</p><h3>Beds, resources and essentials</h3></div><PackagePlus size={19} /></div>
                <div className="field-officer-dashboard__inventory-grid">
                  <label>Total beds<input min="0" onChange={(event) => setInventoryState((current) => ({ ...current, totalBeds: event.target.value }))} type="number" value={inventoryState.totalBeds} /></label>
                  <label>Occupied beds<input min="0" onChange={(event) => setInventoryState((current) => ({ ...current, occupiedBeds: event.target.value }))} type="number" value={inventoryState.occupiedBeds} /></label>
                  <label>Emergency kits<input min="0" onChange={(event) => setInventoryState((current) => ({ ...current, emergencyKits: event.target.value }))} type="number" value={inventoryState.emergencyKits} /></label>
                  <label>Medical kits<input min="0" onChange={(event) => setInventoryState((current) => ({ ...current, medicalKitsResource: event.target.value }))} type="number" value={inventoryState.medicalKitsResource} /></label>
                  <label>Oxygen tanks<input min="0" onChange={(event) => setInventoryState((current) => ({ ...current, oxygenTanks: event.target.value }))} type="number" value={inventoryState.oxygenTanks} /></label>
                  <label>Fuel<input min="0" onChange={(event) => setInventoryState((current) => ({ ...current, fuel: event.target.value }))} type="number" value={inventoryState.fuel} /></label>
                  <label>Food portions<input min="0" onChange={(event) => setInventoryState((current) => ({ ...current, food: event.target.value }))} type="number" value={inventoryState.food} /></label>
                  <label>Water litres<input min="0" onChange={(event) => setInventoryState((current) => ({ ...current, water: event.target.value }))} type="number" value={inventoryState.water} /></label>
                </div>
                <button className="dashboard-panel__button dashboard-panel__button--primary" type="submit"><CheckCircle2 size={16} /> Save inventory update</button>
              </form>

              <form className="field-officer-dashboard__request" onSubmit={handleSupplyRequest}>
                <div className="dashboard-panel__heading"><div><p>District support</p><h3>Request supplies</h3></div><Truck size={19} /></div>
                <div className="field-officer-dashboard__request-grid"><label>Supply<select onChange={(event) => setSupplyRequest((current) => ({ ...current, item: event.target.value }))} value={supplyRequest.item}><option>Food</option><option>Water</option><option>Oxygen tanks</option><option>Medical kits</option><option>Emergency kits</option><option>Fuel</option></select></label><label>Quantity<input min="1" onChange={(event) => setSupplyRequest((current) => ({ ...current, quantity: event.target.value }))} type="number" value={supplyRequest.quantity} /></label></div><label className="field-officer-dashboard__request-note">Note<textarea onChange={(event) => setSupplyRequest((current) => ({ ...current, note: event.target.value }))} placeholder="Add urgency or delivery details" value={supplyRequest.note} /></label><button className="dashboard-panel__button" type="submit"><Droplets size={16} /> Notify district officer</button>
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

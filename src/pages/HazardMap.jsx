import { useState } from 'react';
import { Accessibility, AlertTriangle, BadgeCheck, Check, CheckCircle2, ChevronDown, CircleAlert, Layers3, MapPin, Route, ShieldCheck, Users, X } from 'lucide-react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import EvacuationPlanWorkflow from '../components/EvacuationPlanWorkflow';
import MapLegend from '../components/MapLegend';
import floodData from '../data/flood';
import hyderabadCycloneData from '../data/hyderabadCyclone';
import landslideData from '../data/landslide';
import EvacuationRoute from '../map/EvacuationRoute';
import HazardZones from '../map/HazardZones';
import Shelters from '../map/Shelters';

const scenarios = { flood: floodData, landslide: landslideData, cyclone: hyderabadCycloneData };

function Toggle({ checked, label, onChange }) {
  return (
    <label className="layer-toggle">
      <input checked={checked} type="checkbox" onChange={onChange} />
      <span className="layer-toggle__box">{checked && <Check size={12} />}</span>
      <span>{label}</span>
    </label>
  );
}

function ShelterOption({ shelter }) {
  return (
    <article className={`shelter-option${shelter.recommended ? ' shelter-option--recommended' : ''}${shelter.status === 'INSUFFICIENT CAPACITY' ? ' shelter-option--insufficient' : ''}`}>
      <div className="shelter-option__heading">
        <div><h3>{shelter.name}</h3><p>{shelter.type}</p></div>
        {shelter.recommended ? <BadgeCheck size={20} /> : <CircleAlert size={20} />}
      </div>
      <dl className="shelter-option__facts">
        <div><dt>Capacity</dt><dd>{shelter.capacity}</dd></div>
        <div><dt>Available</dt><dd>{shelter.available}</dd></div>
        <div><dt>Distance</dt><dd>{shelter.distance}</dd></div>
        <div><dt>Hazard Exposure</dt><dd className="safe-text">{shelter.exposure}</dd></div>
        <div><dt>Accessibility</dt><dd className="safe-text">{shelter.accessibility}</dd></div>
        {shelter.vulnerabilitySupport && <div><dt>Vulnerable Support</dt><dd className="safe-text">{shelter.vulnerabilitySupport}</dd></div>}
      </dl>
      <div className="shelter-option__status"><strong>{shelter.status}</strong>{shelter.reason && <span>{shelter.reason}</span>}</div>
      <p className="shelter-option__label">{shelter.recommended ? 'RECOMMENDED BY SAHAS' : shelter.status === 'INSUFFICIENT CAPACITY' ? 'NOT RECOMMENDED' : 'ALTERNATE SHELTER'}</p>
    </article>
  );
}

function RelocationDrawer({ scenario, onClose, onShowRoute }) {
  const { relocation } = scenario;
  const { capacity } = relocation;
  const capacityPercentage = Math.round((capacity.required / capacity.total) * 100);

  return (
    <aside className="relocation-drawer" aria-labelledby="relocation-title">
      <div className="relocation-drawer__header">
        <div><p>Static decision-support scenario</p><h2 id="relocation-title">Relocation Analysis</h2><span>Shelter suitability for affected population</span></div>
        <button aria-label="Close analysis" onClick={onClose} type="button"><X size={18} /></button>
      </div>
      <div className="relocation-summary">
        <div><span>Selected Habitation</span><strong>{relocation.selectedHabitation}</strong></div>
        <div><span>Population Requiring Relocation</span><strong>{relocation.requiredPopulation}</strong></div>
        <div><span>Vulnerable Population</span><strong>{relocation.vulnerablePopulation}</strong></div>
      </div>
      <div className="relocation-drawer__content">
        {relocation.shelterOptions.map((shelter) => <ShelterOption key={shelter.id} shelter={shelter} />)}
        <section className="why-shelter">
          <h3>Why This Shelter?</h3>
          <ul>
            <li><CheckCircle2 size={14} /> Sufficient carrying capacity</li>
            <li><CheckCircle2 size={14} /> Outside identified hazard zone</li>
            <li><CheckCircle2 size={14} /> Safe access route available</li>
            <li><CheckCircle2 size={14} /> Supports vulnerable population</li>
            <li><CheckCircle2 size={14} /> Can accommodate the affected population</li>
          </ul>
          <div className="why-shelter__distance"><span>Distance: <strong>{relocation.shelterOptions.find((shelter) => shelter.recommended).distance}</strong></span><span>Additional distance compared with nearest shelter: <strong>{relocation.additionalDistance}</strong></span></div>
          <p>{relocation.explanation}</p>
        </section>
        <section className="capacity-panel">
          <h3>Carrying Capacity</h3>
          <div className="capacity-panel__numbers"><span>Required <strong>{capacity.required.toLocaleString()} people</strong></span><span>{capacity.shelter} <strong>{capacity.total.toLocaleString()} capacity</strong></span></div>
          <div className="capacity-bar" aria-label={`${capacityPercentage}% of ${capacity.shelter} capacity assigned`}><span style={{ width: `${capacityPercentage}%` }} /></div>
          <div className="capacity-panel__footer"><span>Remaining: <strong>{capacity.remaining.toLocaleString()}</strong></span><strong>SUFFICIENT</strong></div>
        </section>
        <section className="decision-summary">
          <p>SAHAS RECOMMENDATION</p>
          <div><strong>{relocation.selectedHabitation}</strong><span>↓</span><strong>{relocation.recommendedShelter}</strong></div>
          <dl><div><dt>Population assigned</dt><dd>{relocation.requiredPopulation}</dd></div><div><dt>Capacity</dt><dd>{capacity.total.toLocaleString()}</dd></div><div><dt>Remaining capacity</dt><dd>{capacity.remaining.toLocaleString()}</dd></div></dl>
          <span><ShieldCheck size={15} /> RELOCATION FEASIBLE</span>
        </section>
      </div>
      <div className="relocation-drawer__actions"><button className="relocation-drawer__route" onClick={onShowRoute} type="button">SHOW EVACUATION ROUTE <Route size={16} /></button><button className="relocation-drawer__close" onClick={onClose} type="button">CLOSE ANALYSIS</button></div>
    </aside>
  );
}

function WhatIfPanel({ scenario, selectedLevel, onSelect }) {
  const projection = scenario.whatIf[selectedLevel];
  const levels = ['normal', 'elevated', 'severe'];

  return (
    <section className="what-if-panel" aria-labelledby="what-if-title">
      <div className="what-if-panel__heading"><div><p>Illustrative projection · Demo scenario</p><h3 id="what-if-title">What-If Scenario</h3><span>Explore projected risk under changing rainfall conditions</span></div></div>
      <div className="what-if-options" role="group" aria-label="Rainfall intensity">
        {levels.map((level) => <button className={selectedLevel === level ? `what-if-options__button what-if-options__button--${level}` : 'what-if-options__button'} key={level} onClick={() => onSelect(level)} type="button">{level}</button>)}
      </div>
      <div className={`what-if-selected what-if-selected--${projection.riskTone}`}>
        <div><span>Rainfall Intensity</span><strong>{projection.label}</strong></div>
        <div><span>Population at Risk</span><strong>{projection.populationAtRisk}</strong></div>
        <div><span>Risk Level</span><strong>{projection.riskLevel}</strong></div>
        <div><span>Red Zone</span><strong>{projection.redZone}</strong></div>
        <div><span>Additional Shelter Required</span><strong>{projection.shelterNeed}</strong></div>
        <div><span>Recommended Action</span><strong>{projection.action}</strong></div>
        <div className="what-if-selected__status"><span>Status</span><strong>{projection.status}</strong></div>
      </div>
      {selectedLevel === 'severe' && <p className="what-if-warning"><AlertTriangle size={15} /> ADDITIONAL SHELTER CAPACITY REQUIRED</p>}
      <div className="what-if-insight"><strong>SAHAS INSIGHT</strong><p>{projection.insight}</p></div>
      <div className="what-if-comparison" aria-label="Scenario comparison"><div className="what-if-comparison__header"><span />{levels.map((level) => <strong key={level}>{level}</strong>)}</div><div><span>Population Risk</span>{levels.map((level) => <strong key={level}>{scenario.whatIf[level].populationAtRisk}</strong>)}</div><div><span>Risk Level</span>{levels.map((level) => <strong className={`what-if-comparison__${scenario.whatIf[level].riskTone}`} key={level}>{scenario.whatIf[level].riskLevel}</strong>)}</div><div><span>Shelter Need</span>{levels.map((level) => <strong key={level}>{scenario.whatIf[level].shelterNeed}</strong>)}</div></div>
    </section>
  );
}

export default function HazardMap() {
  const [scenarioKey, setScenarioKey] = useState('flood');
  const [showRelocation, setShowRelocation] = useState(false);
  const [showRouteGuidance, setShowRouteGuidance] = useState(false);
  const [layers, setLayers] = useState({ zones: true, population: true, vulnerability: true, shelters: true, routes: true });
  const [whatIfLevel, setWhatIfLevel] = useState('elevated');
  const scenario = scenarios[scenarioKey];
  const projection = scenario.whatIf[whatIfLevel];

  function toggleLayer(layer) {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }

  return (
    <div className="hazard-analysis">
      <section className="hazard-analysis__heading">
        <div>
          <p>Government Hazard Analysis</p>
          <h1>Decision Support Map</h1>
        </div>
        <label className="hazard-selector" htmlFor="hazard-type">
          <span>Hazard Type</span>
          <div><select id="hazard-type" value={scenarioKey} onChange={(event) => setScenarioKey(event.target.value)}><option value="flood">Flood</option><option value="landslide">Landslide</option><option value="cyclone">Cyclone — Hyderabad (Demo)</option></select><ChevronDown size={15} /></div>
        </label>
      </section>

      <section className="hazard-analysis__workspace">
        <article className="analysis-map-panel">
          <div className="analysis-map-panel__bar">
            <span><MapPin size={16} /> {scenario.location} · {scenario.name} scenario</span>
            <span className={`analysis-map-panel__risk analysis-map-panel__risk--${projection.riskTone}`}>{projection.riskLevel} RISK</span>
          </div>
          <div className="analysis-map-frame">
            <MapContainer key={scenario.id} center={scenario.center} className="analysis-map" scrollWheelZoom zoom={scenario.zoom}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {layers.zones && <HazardZones scenario={scenarioKey} whatIfLevel={whatIfLevel} />}
              {layers.routes && <EvacuationRoute scenario={scenarioKey} />}
              {layers.shelters && <Shelters scenario={scenarioKey} />}
              {layers.population && scenario.populationPoints.map((position, index) => (
                <CircleMarker center={position} key={`population-${index}`} pathOptions={{ color: '#6cb7ec', fillColor: '#338cc7', fillOpacity: 0.65, weight: 1 }} radius={11}><Popup>Population concentration</Popup></CircleMarker>
              ))}
              {layers.vulnerability && scenario.vulnerabilityPoints.map((position, index) => (
                <CircleMarker center={position} key={`vulnerability-${index}`} pathOptions={{ color: '#ffffff', fillColor: '#a670d1', fillOpacity: 0.9, weight: 2 }} radius={7}><Popup>Vulnerable population concentration</Popup></CircleMarker>
              ))}
              {scenario.places.map((place) => (
                <CircleMarker center={place.position} key={place.name} pathOptions={{ color: '#ffffff', fillColor: place.color, fillOpacity: 1, weight: 2 }} radius={6}>
                  <Popup><strong>{place.name}</strong></Popup>
                </CircleMarker>
              ))}
            </MapContainer>
            <MapLegend dark showRoute />
            {showRouteGuidance && <section className="route-guidance" aria-label="Evacuation route guidance"><div><strong>{scenario.relocation.routeInfo.origin}</strong><span>↓</span><strong>Safe alternate road</strong><span>↓</span><strong>{scenario.relocation.routeInfo.destination}</strong></div><p><span>DIRECT ROUTE</span><strong className="unsafe-text">⚠ {scenario.relocation.routeInfo.direct}</strong></p><p><span>ALTERNATE ROUTE</span><strong className="safe-text">✓ {scenario.relocation.routeInfo.alternate}</strong></p></section>}
            <section className="map-layer-controls" aria-label="Map layer controls">
              <div><Layers3 size={15} /><strong>LAYERS</strong></div>
              <Toggle checked={layers.zones} label="Hazard Zones" onChange={() => toggleLayer('zones')} />
              <Toggle checked={layers.population} label="Population" onChange={() => toggleLayer('population')} />
              <Toggle checked={layers.vulnerability} label="Vulnerability" onChange={() => toggleLayer('vulnerability')} />
              <Toggle checked={layers.shelters} label="Shelters" onChange={() => toggleLayer('shelters')} />
              <Toggle checked={layers.routes} label="Evacuation Routes" onChange={() => toggleLayer('routes')} />
            </section>
          </div>
        </article>

        <aside className="analysis-panel" aria-labelledby="analysis-title">
          <div className="analysis-panel__title"><div><p>Curated demo scenario</p><h2 id="analysis-title">Hazard Analysis</h2></div><AlertTriangle size={20} /></div>
          <dl className="analysis-summary">
            <div><dt>Location</dt><dd>{scenario.location}</dd></div>
            <div><dt>Hazard</dt><dd>{scenario.name}</dd></div>
            <div><dt>Risk Level</dt><dd className={`analysis-summary__risk analysis-summary__risk--${projection.riskTone}`}>{projection.riskLevel}</dd></div>
          </dl>
          <div className="exposure-grid">
            <div><Users size={17} /><span>Population at Risk</span><strong>{projection.populationAtRisk}</strong></div>
            <div><Accessibility size={17} /><span>Vulnerable Population</span><strong>{scenario.vulnerablePopulation}</strong></div>
          </div>

          <section className="analysis-section">
            <h3>Risk Drivers</h3>
            <div className="risk-driver-list">
              {scenario.riskDrivers.map((driver) => <div key={driver.label}><span>{driver.label}</span><strong className={`risk-pill risk-pill--${driver.level.toLowerCase()}`}>{driver.level}</strong></div>)}
            </div>
          </section>

          <section className="analysis-section">
            <h3>Vulnerability Breakdown</h3>
            <div className="vulnerability-list">
              {scenario.vulnerability.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}
            </div>
          </section>

          {scenario.roadStatus && <section className="road-statuses" aria-label="Road access status">{scenario.roadStatus.map((road) => <div className={`road-status road-status--${road.tone}`} key={road.label}><span>{road.label}</span><strong>{road.value}</strong></div>)}</section>}

          <section className={`recommended-action recommended-action--${projection.riskTone}`}>
            <span>Recommended Action</span>
            <strong>{projection.action}</strong>
            <p>{projection.insight}</p>
            <button onClick={() => setShowRelocation(true)} type="button">VIEW RELOCATION OPTIONS <Route size={16} /></button>
          </section>
          <WhatIfPanel scenario={scenario} selectedLevel={whatIfLevel} onSelect={setWhatIfLevel} />
        </aside>
      </section>

      {scenarioKey === 'cyclone' && <EvacuationPlanWorkflow />}

      {showRelocation && <RelocationDrawer scenario={scenario} onClose={() => setShowRelocation(false)} onShowRoute={() => { setLayers((current) => ({ ...current, routes: true })); setShowRouteGuidance(true); }} />}
    </div>
  );
}

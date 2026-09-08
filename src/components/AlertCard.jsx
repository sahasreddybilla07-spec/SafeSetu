export default function AlertCard({ incident, onSelect }) {
  return (
    <button className={`public-alert-card public-alert-card--${incident.tone}`} onClick={onSelect} type="button">
      <div className="public-alert-card__top">
        <span className="public-alert-card__severity">{incident.severity}</span>
        <span className="public-alert-card__hazard">{incident.hazard}</span>
      </div>
      <h3>{incident.location}</h3>
      <p className="public-alert-card__population"><strong>{incident.populationAtRisk}</strong> people at risk</p>
      <p className="public-alert-card__action">Action: {incident.action}</p>
    </button>
  );
}

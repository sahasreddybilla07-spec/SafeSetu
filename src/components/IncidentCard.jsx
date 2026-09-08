export default function IncidentCard({ icon, incident, location, population, severity, status, tone }) {
  return (
    <article className={`incident-card incident-card--${tone}`}>
      <div className="incident-card__topline">
        <span className="incident-card__icon">{icon}</span>
        <span className="incident-card__severity">{severity}</span>
      </div>
      <h3>{incident} <span>—</span> {location}</h3>
      <p className="incident-card__population">Population: <strong>{population} people</strong></p>
      <p className="incident-card__status">{status}</p>
    </article>
  );
}

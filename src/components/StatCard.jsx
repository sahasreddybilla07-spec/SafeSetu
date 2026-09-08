export default function StatCard({ icon, label, value, supportingText, tone = 'neutral' }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__heading">
        <span>{label}</span>
        <span className="stat-card__icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <p>{supportingText}</p>
    </article>
  );
}

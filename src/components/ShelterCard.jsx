export default function ShelterCard({ shelter, onSelect }) {
  return (
    <button className="public-shelter-card" onClick={onSelect} type="button">
      <div className="public-shelter-card__top">
        <h3>{shelter.name}</h3>
        <span className="public-shelter-card__status">{shelter.status}</span>
      </div>
      <p className="public-shelter-card__capacity">Capacity: <strong>{shelter.capacity}</strong></p>
    </button>
  );
}

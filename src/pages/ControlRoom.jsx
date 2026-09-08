import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ControlRoom() {
  return (
    <section className="page">
      <div className="page__content">
        <h1>Control Room</h1>
        <p>Full multi-incident coordination tools will be added in a later phase.</p>
        <p className="page__note">
          The officer → public evacuation workflow demo (select a plan, send it to the public, preview the citizen
          view) is available now from the Hazard Map.
        </p>
        <Link className="page__link" to="/admin/map">
          Open Hazard Map <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

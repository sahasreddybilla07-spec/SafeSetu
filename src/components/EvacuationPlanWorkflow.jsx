import { useEffect, useState } from 'react';
import { CheckCircle2, Send, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { evacuationPlans, getPlanById, readIssuedPlan, saveIssuedPlan } from '../data/emergencyScenario';

export default function EvacuationPlanWorkflow() {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [issuedRecord, setIssuedRecord] = useState(null);

  useEffect(() => {
    const existing = readIssuedPlan();
    if (existing) {
      setIssuedRecord(existing);
      setSelectedPlanId(existing.planId);
    }
  }, []);

  const selectedPlan = getPlanById(selectedPlanId);
  const issued = Boolean(issuedRecord);

  function selectPlan(id) {
    if (issued) return;
    setSelectedPlanId(id);
  }

  function sendToPublic() {
    if (!selectedPlan) return;
    const record = saveIssuedPlan(selectedPlan.id);
    setIssuedRecord(record);
  }

  return (
    <section className="evac-workflow" aria-label="Evacuation plan workflow">
      <div className="evac-workflow__heading">
        <div>
          <p>Officer decision support</p>
          <h2>Evacuation Plan Options</h2>
        </div>
        <span className="evac-workflow__tag">DEMO SCENARIO • ILLUSTRATIVE DATA</span>
      </div>

      <div className="evac-plan-grid">
        {evacuationPlans.map((plan) => (
          <article className={`evac-plan-card${selectedPlanId === plan.id ? ' evac-plan-card--selected' : ''}${plan.recommended ? ' evac-plan-card--recommended' : ''}`} key={plan.id}>
            <div className="evac-plan-card__top">
              <h3>{plan.name}</h3>
              {plan.status && <span className="evac-plan-card__status">{plan.status}</span>}
            </div>
            <dl className="evac-plan-card__facts">
              <div><dt>Departure</dt><dd>{plan.departure}</dd></div>
              <div><dt>Destination</dt><dd>{plan.destination}</dd></div>
              <div><dt>Route</dt><dd>{plan.route}</dd></div>
              <div><dt>Est. Travel</dt><dd>{plan.travelTime}</dd></div>
              <div><dt>Capacity</dt><dd>{plan.capacity}</dd></div>
              <div><dt>Route Risk</dt><dd className={`evac-risk-pill evac-risk-pill--${plan.riskTone}`}>{plan.risk}</dd></div>
            </dl>
            {plan.recommendedReason && <p className="evac-plan-card__reason">SAFESETU RECOMMENDED — {plan.recommendedReason}</p>}
            <button disabled={issued} onClick={() => selectPlan(plan.id)} type="button">
              {selectedPlanId === plan.id ? 'SELECTED' : 'SELECT PLAN'}
            </button>
          </article>
        ))}
      </div>

      <div className="evac-comparison-wrap">
        <table className="evac-comparison-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Departure</th>
              <th>Destination</th>
              <th>Travel Time</th>
              <th>Capacity</th>
              <th>Route Risk</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {evacuationPlans.map((plan) => (
              <tr className={selectedPlanId === plan.id ? 'evac-comparison-table__row--selected' : undefined} key={plan.id}>
                <td>{plan.name}</td>
                <td>{plan.departure}</td>
                <td>{plan.destination}</td>
                <td>{plan.travelTime}</td>
                <td>{plan.capacity}</td>
                <td>{plan.risk}</td>
                <td>{plan.status || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPlan && (
        <div className="evac-selected-summary">
          <h3>SELECTED EVACUATION PLAN</h3>
          <p className="evac-selected-summary__destination">{selectedPlan.destination}</p>
          <dl className="evac-selected-summary__facts">
            <div><dt>Depart by</dt><dd>{selectedPlan.departure}</dd></div>
            <div><dt>Estimated travel</dt><dd>{selectedPlan.travelTime}</dd></div>
            <div><dt>Route</dt><dd>{selectedPlan.route}</dd></div>
            <div><dt>Capacity</dt><dd>{selectedPlan.capacity}</dd></div>
            <div><dt>Route Risk</dt><dd>{selectedPlan.risk}</dd></div>
          </dl>

          {!issued && (
            <button className="evac-send-button" onClick={sendToPublic} type="button">
              <Send size={15} /> SEND EVACUATION PLAN TO PUBLIC
            </button>
          )}
        </div>
      )}

      {issued && (
        <div className="evac-issued-panel">
          <p className="evac-issued-panel__status"><CheckCircle2 size={15} /> EVACUATION PLAN ISSUED</p>
          <strong>PLAN SENT SUCCESSFULLY</strong>
          <p>Citizens in the affected zone will now see the approved evacuation instructions.</p>
          <span className="evac-issued-panel__timestamp">{selectedPlan?.departure} — DEMO ALERT ISSUED</span>
          <button className="evac-citizen-button" onClick={() => navigate('/emergency')} type="button">
            <Users size={15} /> <span className="evac-citizen-button__tag">DEMO MODE</span> VIEW CITIZEN POV
          </button>
        </div>
      )}
    </section>
  );
}

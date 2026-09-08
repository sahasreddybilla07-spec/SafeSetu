import { BellRing } from 'lucide-react';

const defaultAlerts = [
  '14:32 — Rainfall +18mm in Rampur Block',
  '14:35 — River level nearing danger mark',
  '14:41 — Shelter C requested by 2 incidents',
  '14:44 — Landslide warning issued for Kotwa Hills',
];

export default function LiveTicker({ alerts = defaultAlerts }) {
  const tickerAlerts = [...alerts, ...alerts];

  return (
    <section className="live-ticker" aria-label="Simulated live alerts">
      <div className="live-ticker__label"><BellRing size={16} /><span>LIVE ALERTS</span></div>
      <div className="live-ticker__viewport">
        <div className="live-ticker__track">
          {tickerAlerts.map((alert, index) => <span key={`${alert}-${index}`}>{alert}</span>)}
        </div>
      </div>
      <span className="live-ticker__demo">SIMULATED DEMO DATA</span>
    </section>
  );
}

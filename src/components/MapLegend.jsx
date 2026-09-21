import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function MapLegend({ collapsible = false, dark = false, showRoute = false, showHazardIcon = false, showDemoTag = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const classes = `map-legend${dark ? ' map-legend--dark' : ''}${collapsible ? ' map-legend--collapsible' : ''}${isOpen ? ' map-legend--open' : ''}`;

  return (
    <section className={classes} aria-label="Map legend">
      {collapsible ? (
        <button aria-expanded={isOpen} className="map-legend__toggle" onClick={() => setIsOpen((open) => !open)} type="button">
          <span>Map legend</span><ChevronDown size={16} aria-hidden="true" />
        </button>
      ) : <h2>Map Legend</h2>}
      {(!collapsible || isOpen) && <div className="map-legend__content">
        <ul>
          <li><span className="map-legend__swatch map-legend__swatch--red" />Red <em>— Critical risk</em></li>
          <li><span className="map-legend__swatch map-legend__swatch--orange" />Orange <em>— High risk</em></li>
          <li><span className="map-legend__swatch map-legend__swatch--yellow" />Yellow <em>— Moderate risk</em></li>
          <li><span className="map-legend__swatch map-legend__swatch--green" />Green <em>— Safe area</em></li>
          <li><span className="map-legend__shelter">●</span>Green marker <em>— Emergency shelter</em></li>
          {showHazardIcon && <li><span className="map-legend__hazard">✦</span>Hazard icon <em>— Incident location</em></li>}
          {showRoute && <li><span className="map-legend__route">━</span>Route <em>— Recommended evacuation route</em></li>}
        </ul>
        {showDemoTag && <p className="map-legend__demo-tag">DEMO DATA</p>}
      </div>}
    </section>
  );
}

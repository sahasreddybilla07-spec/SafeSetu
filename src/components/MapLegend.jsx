export default function MapLegend({ dark = false, showRoute = false, showHazardIcon = false, showDemoTag = false }) {
  return (
    <section className={`map-legend${dark ? ' map-legend--dark' : ''}`} aria-label="Map legend">
      <h2>Map Legend</h2>
      <ul>
        <li><span className="map-legend__swatch map-legend__swatch--red" />Red <em>— Critical / High Risk</em></li>
        <li><span className="map-legend__swatch map-legend__swatch--orange" />Orange <em>— Moderate Risk</em></li>
        <li><span className="map-legend__swatch map-legend__swatch--green" />Green <em>— Safe Area</em></li>
        <li><span className="map-legend__shelter">⌂</span>Blue Marker <em>— Emergency Shelter</em></li>
        {showHazardIcon && <li><span className="map-legend__hazard">▲</span>Hazard Icon <em>— Incident Location</em></li>}
        {showRoute && <li><span className="map-legend__route">━</span>Route <em>— Recommended Evacuation Route</em></li>}
      </ul>
      {showDemoTag && <p className="map-legend__demo-tag">DEMO DATA</p>}
    </section>
  );
}

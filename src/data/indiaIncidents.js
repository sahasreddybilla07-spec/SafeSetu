export const indiaCenter = [22.97, 78.65];
export const indiaZoom = 5;

// Curated illustrative scenarios only — never live emergency alerts.
export const incidents = [
  {
    id: 'assam-flood', hazard: 'Flood', region: 'Assam', location: 'Brahmaputra basin, Assam', center: [26.2006, 92.9376], zoom: 7,
    severity: 'HIGH', tone: 'high', populationAtRisk: '3,120', action: 'Prepare evacuation for low-lying settlements',
    reason: 'Brahmaputra river levels are above the illustrative danger mark after sustained upstream rainfall.', status: 'Monitoring & preparedness', zoneRadius: 90000,
    measurements: [{ label: 'Water level', value: '7.8 m', highlight: true }, { label: 'Rainfall', value: '21.4 cm / 24h' }, { label: 'Rainfall rate', value: '4.2 cm / hr' }, { label: 'Affected area', value: '18 villages' }, { label: 'Evacuation status', value: 'Standby' }],
  },
  {
    id: 'odisha-cyclone', hazard: 'Cyclone', region: 'Odisha', location: 'Odisha coastal belt', center: [19.8135, 85.8312], zoom: 6.5,
    severity: 'CRITICAL', tone: 'critical', populationAtRisk: '8,450', action: 'Evacuate vulnerable coastal communities',
    reason: 'An illustrative cyclonic system is moving toward the coast with storm-surge and high-wind exposure.', status: 'Evacuation readiness', zoneRadius: 130000,
    measurements: [{ label: 'Wind speed', value: '128 km/h', highlight: true }, { label: 'Max sustained wind', value: '112 km/h' }, { label: 'Rainfall', value: '18.6 cm' }, { label: 'Movement', value: 'NW at 14 km/h' }, { label: 'Expected landfall', value: 'Puri–Kendrapara coast' }],
  },
  {
    id: 'uttarakhand-landslide', hazard: 'Landslide', region: 'Uttarakhand', location: 'Himalayan corridor, Uttarakhand', center: [30.3165, 78.5], zoom: 7,
    severity: 'HIGH', tone: 'high', populationAtRisk: '2,180', action: 'Relocate exposed hillside households',
    reason: 'Continuous rain and slope saturation are creating an illustrative instability risk near hillside settlements.', status: 'Access under assessment', zoneRadius: 70000,
    measurements: [{ label: 'Rainfall', value: '16.2 cm / 24h', highlight: true }, { label: 'Slope instability', value: 'High' }, { label: 'Affected area', value: '9 hillside hamlets' }, { label: 'Road access', value: '2 routes restricted' }, { label: 'Landslide severity', value: 'High' }],
  },
  {
    id: 'delhi-earthquake', hazard: 'Earthquake', region: 'Delhi NCR', location: 'Delhi NCR', center: [28.6139, 77.209], zoom: 7.2,
    severity: 'MODERATE', tone: 'moderate', populationAtRisk: '4,760', action: 'Inspect vulnerable structures and keep clear of damaged buildings',
    reason: 'A simulated regional seismic event demonstrates building-safety and response coordination.', status: 'Post-event assessment', zoneRadius: 76000,
    measurements: [{ label: 'Magnitude', value: '5.4 Mw', highlight: true }, { label: 'Depth', value: '16 km' }, { label: 'Epicenter', value: 'East of Delhi NCR' }, { label: 'Aftershocks', value: 'No significant activity' }, { label: 'Assessment status', value: 'In progress' }],
  },
  {
    id: 'rajasthan-heatwave', hazard: 'Heatwave', region: 'Rajasthan', location: 'Jaipur region, Rajasthan', center: [26.9124, 75.7873], zoom: 6.5,
    severity: 'MODERATE', tone: 'moderate', populationAtRisk: '5,600', action: 'Issue heat-health advisory and open cooling points',
    reason: 'A sustained illustrative high-temperature period shows heat exposure for outdoor workers and vulnerable residents.', status: 'Heat health response', zoneRadius: 110000,
    measurements: [{ label: 'Temperature', value: '45.2°C', highlight: true }, { label: 'Feels-like', value: '48.1°C' }, { label: 'Heat index', value: 'Extreme caution' }, { label: 'Duration', value: '4 consecutive days' }, { label: 'Cooling points', value: '12 ready' }],
  },
  {
    id: 'andaman-tsunami', hazard: 'Tsunami', region: 'Andaman & Nicobar', location: 'Andaman coastal communities', center: [11.6234, 92.7265], zoom: 6.8,
    severity: 'CRITICAL', tone: 'critical', populationAtRisk: '1,940', action: 'Move immediately to designated higher ground',
    reason: 'A simulated offshore trigger demonstrates evacuation planning for exposed coastal settlements.', status: 'Coastal evacuation drill', zoneRadius: 100000,
    measurements: [{ label: 'Wave height', value: '2.4 m', highlight: true }, { label: 'Estimated arrival', value: '42 min' }, { label: 'Source / trigger', value: 'Offshore seismic event' }, { label: 'Coastal area', value: '3 vulnerable stretches' }, { label: 'Evacuation status', value: 'Immediate movement' }],
  },
  {
    id: 'mp-wildfire', hazard: 'Wildfire', region: 'Madhya Pradesh', location: 'Satpura forest fringe, Madhya Pradesh', center: [22.75, 78.35], zoom: 7,
    severity: 'HIGH', tone: 'high', populationAtRisk: '1,320', action: 'Avoid forest approaches and prepare village fire breaks',
    reason: 'Dry fuel conditions and wind demonstrate illustrative wildfire spread monitoring.', status: 'Containment planning', zoneRadius: 62000,
    measurements: [{ label: 'Fire intensity', value: 'High', highlight: true }, { label: 'Area affected', value: '640 hectares' }, { label: 'Wind speed', value: '24 km/h' }, { label: 'Spread direction', value: 'East-northeast' }, { label: 'Air-quality risk', value: 'Unhealthy' }],
  },
  {
    id: 'mumbai-rainfall', hazard: 'Heavy Rainfall', region: 'Maharashtra', location: 'Mumbai metropolitan region', center: [19.076, 72.8777], zoom: 7.3,
    severity: 'HIGH', tone: 'high', populationAtRisk: '3,890', action: 'Avoid waterlogged routes and monitor local flood advisories',
    reason: 'An illustrative intense-rainfall pattern demonstrates drainage, transport and urban flood response coordination.', status: 'Transport monitoring', zoneRadius: 60000,
    measurements: [{ label: 'Rainfall amount', value: '28.7 cm / 24h', highlight: true }, { label: 'Rainfall rate', value: '6.1 cm / hr' }, { label: 'Duration', value: '9 hours' }, { label: 'Flood probability', value: 'Elevated' }, { label: 'Affected region', value: 'Low-lying wards' }],
  },
];

export const shelters = [
  { id: 'assam-relief', name: 'Assam Relief Centre', position: [26.1445, 91.7362], capacity: '3,500', status: 'AVAILABLE', incidentId: 'assam-flood' },
  { id: 'odisha-emergency', name: 'Odisha Emergency Shelter', position: [20.2961, 85.8245], capacity: '10,000', status: 'AVAILABLE', incidentId: 'odisha-cyclone' },
  { id: 'dehradun-relief', name: 'Dehradun Relief Centre', position: [30.3165, 78.0322], capacity: '3,000', status: 'AVAILABLE', incidentId: 'uttarakhand-landslide' },
  { id: 'delhi-community', name: 'Delhi Community Support Centre', position: [28.5355, 77.391], capacity: '4,200', status: 'AVAILABLE', incidentId: 'delhi-earthquake' },
  { id: 'jaipur-heat-relief', name: 'Jaipur Cooling Centre', position: [26.934, 75.8267], capacity: '6,500', status: 'AVAILABLE', incidentId: 'rajasthan-heatwave' },
  { id: 'andaman-evacuation', name: 'Andaman Elevated Shelter', position: [11.67, 92.74], capacity: '2,100', status: 'AVAILABLE', incidentId: 'andaman-tsunami' },
  { id: 'satpura-relief', name: 'Satpura Relief Point', position: [22.83, 78.47], capacity: '1,800', status: 'AVAILABLE', incidentId: 'mp-wildfire' },
  { id: 'mumbai-relief', name: 'Mumbai Emergency Centre', position: [19.124, 72.913], capacity: '5,000', status: 'AVAILABLE', incidentId: 'mumbai-rainfall' },
];

export const severityRank = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 };

export function hazardGlyph(hazard) {
  return ({ Flood: '🌊', Cyclone: '🌀', Landslide: '⛰️', Earthquake: '⌁', Heatwave: '☀️', Tsunami: '🌊', Wildfire: '🔥', 'Heavy Rainfall': '🌧️' })[hazard] ?? '⚠️';
}

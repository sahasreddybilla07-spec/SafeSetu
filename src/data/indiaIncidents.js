export const indiaCenter = [22.97, 78.65];
export const indiaZoom = 5;

export const incidents = [
  {
    id: 'assam-flood',
    hazard: 'Flood',
    region: 'Assam',
    location: 'Assam / Northeast',
    center: [26.2006, 92.9376],
    zoom: 7,
    severity: 'HIGH',
    tone: 'critical',
    populationAtRisk: '3,120',
    action: 'PREPARE EVACUATION',
    reason: 'Brahmaputra river levels rising above the danger mark following heavy upstream rainfall.',
    zoneRadius: 90000,
  },
  {
    id: 'odisha-cyclone',
    hazard: 'Cyclone',
    region: 'Odisha',
    location: 'Odisha Coast',
    center: [19.8135, 85.8312],
    zoom: 6.5,
    severity: 'CRITICAL',
    tone: 'critical',
    populationAtRisk: '8,450',
    action: 'EVACUATE COASTAL BELT',
    reason: 'Cyclonic system approaching the coast with high wind speeds and storm surge risk.',
    zoneRadius: 130000,
  },
  {
    id: 'uttarakhand-landslide',
    hazard: 'Landslide',
    region: 'Uttarakhand',
    location: 'Uttarakhand / Himalayan Region',
    center: [30.3165, 78.5],
    zoom: 7,
    severity: 'HIGH',
    tone: 'critical',
    populationAtRisk: '2,180',
    action: 'RELOCATION ADVISED',
    reason: 'Slope instability and continuous rainfall affecting hillside habitations.',
    zoneRadius: 70000,
  },
  {
    id: 'rajasthan-heatwave',
    hazard: 'Heatwave',
    region: 'Rajasthan',
    location: 'Rajasthan',
    center: [26.9124, 75.7873],
    zoom: 6.5,
    severity: 'MODERATE',
    tone: 'warning',
    populationAtRisk: '5,600',
    action: 'ISSUE HEAT ADVISORY',
    reason: 'Sustained extreme temperatures increasing risk for outdoor workers and vulnerable groups.',
    zoneRadius: 110000,
  },
  {
    id: 'kerala-multihazard',
    hazard: 'Multi-Hazard',
    region: 'Kerala',
    location: 'Kerala / Western Ghats',
    center: [10.3, 76.6],
    zoom: 7,
    severity: 'HIGH',
    tone: 'critical',
    populationAtRisk: '4,250',
    action: 'MONITOR & PREPARE SHELTERS',
    reason: 'Combined heavy rainfall, flooding and landslide susceptibility across the Western Ghats belt.',
    zoneRadius: 80000,
  },
];

export const shelters = [
  {
    id: 'assam-relief',
    name: 'Assam Relief Centre',
    position: [26.1445, 91.7362],
    capacity: '3,500',
    status: 'AVAILABLE',
    incidentId: 'assam-flood',
  },
  {
    id: 'odisha-emergency',
    name: 'Odisha Emergency Shelter',
    position: [20.2961, 85.8245],
    capacity: '10,000',
    status: 'AVAILABLE',
    incidentId: 'odisha-cyclone',
  },
  {
    id: 'dehradun-relief',
    name: 'Dehradun Relief Centre',
    position: [30.3165, 78.0322],
    capacity: '3,000',
    status: 'AVAILABLE',
    incidentId: 'uttarakhand-landslide',
  },
  {
    id: 'jaipur-heat-relief',
    name: 'Jaipur Heat Relief Centre',
    position: [26.9124, 75.7873],
    capacity: '6,500',
    status: 'AVAILABLE',
    incidentId: 'rajasthan-heatwave',
  },
  {
    id: 'kerala-emergency',
    name: 'Kerala Emergency Shelter',
    position: [10.5276, 76.2144],
    capacity: '5,000',
    status: 'AVAILABLE',
    incidentId: 'kerala-multihazard',
  },
];

export const severityRank = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 };

export function hazardGlyph(hazard) {
  switch (hazard) {
    case 'Flood':
      return '🌊';
    case 'Cyclone':
      return '🌀';
    case 'Landslide':
      return '⛰';
    case 'Heatwave':
      return '☀';
    case 'Multi-Hazard':
      return '⚠';
    default:
      return '⚠';
  }
}

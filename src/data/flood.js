const floodData = {
  id: 'flood',
  name: 'Flood',
  location: 'Rampur Block',
  center: [25.457, 82.816],
  zoom: 13,
  riskLevel: 'HIGH',
  riskTone: 'critical',
  populationAtRisk: '2,340',
  vulnerablePopulation: '612',
  zones: [
    { id: 'rampur', label: 'Rampur Block', risk: 'High Risk', color: '#c63737', positions: [[25.463, 82.764], [25.477, 82.793], [25.463, 82.815], [25.445, 82.8], [25.448, 82.775]] },
    { id: 'karanpur', label: 'Karanpur', risk: 'Moderate Risk', color: '#e07b25', positions: [[25.492, 82.812], [25.505, 82.838], [25.493, 82.858], [25.475, 82.842], [25.478, 82.82]] },
    { id: 'lakshmipur', label: 'Lakshmipur Safe Area', risk: 'Safe Area', color: '#2d8a5a', positions: [[25.421, 82.82], [25.438, 82.847], [25.425, 82.87], [25.405, 82.852], [25.406, 82.833]] },
  ],
  places: [
    { name: 'Rampur', position: [25.46, 82.792], color: '#c63737' },
    { name: 'Karanpur', position: [25.452, 82.83], color: '#e07b25' },
    { name: 'Lakshmipur', position: [25.422, 82.851], color: '#2d8a5a' },
  ],
  shelters: [
    { name: 'Shelter A · Rampur Primary School', position: [25.469, 82.787], capacity: '450 people' },
    { name: 'Shelter B · Karanpur Community Hall', position: [25.452, 82.83], capacity: '300 people' },
  ],
  route: [[25.461, 82.785], [25.458, 82.8], [25.455, 82.816], [25.452, 82.83]],
  riskDrivers: [{ label: 'Rainfall', level: 'HIGH' }, { label: 'River Proximity', level: 'HIGH' }, { label: 'Elevation', level: 'HIGH' }, { label: 'Drainage', level: 'MODERATE' }],
  vulnerability: [{ label: 'Children', value: '412' }, { label: 'Elderly', value: '198' }, { label: 'Persons requiring assistance', value: '73' }],
  populationPoints: [[25.459, 82.79], [25.467, 82.801], [25.453, 82.784]],
  vulnerabilityPoints: [[25.458, 82.796], [25.449, 82.787]],
  action: 'EVACUATION ADVISED',
  reason: 'High hazard exposure combined with vulnerable population concentration.',
  relocation: {
    requiredPopulation: '2,340',
    vulnerablePopulation: '612',
    selectedHabitation: 'Rampur Block',
    recommendedShelter: 'Shelter B',
    additionalDistance: '+5.2 km',
    explanation: 'Although Shelter A is closer, its capacity is insufficient for the affected population. Shelter B is recommended because it can safely accommodate the required population.',
    shelterOptions: [
      { id: 'a', name: 'Shelter A', type: 'Community Relief Centre', capacity: '800', available: '800', distance: '3.2 km', exposure: 'SAFE', accessibility: 'GOOD', status: 'INSUFFICIENT CAPACITY', reason: 'Required capacity: 2,340 · Available capacity: 800', recommended: false },
      { id: 'b', name: 'Shelter B', type: 'Government School Relief Centre', capacity: '3,200', available: '3,200', distance: '8.4 km', exposure: 'SAFE', accessibility: 'GOOD', vulnerabilitySupport: 'AVAILABLE', status: 'RECOMMENDED', recommended: true },
    ],
    capacity: { shelter: 'Shelter B', required: 2340, total: 3200, remaining: 860 },
    routeInfo: { origin: 'Rampur', destination: 'Shelter B', direct: 'UNSAFE / FLOOD-PRONE', alternate: 'RECOMMENDED' },
  },
  whatIf: {
    normal: { label: 'Normal', populationAtRisk: '1,240', riskLevel: 'MODERATE', riskTone: 'safe', redZone: 'Limited', shelterNeed: 'NO', action: 'MONITOR', status: 'STABLE', insight: 'Current conditions remain within manageable risk levels.', footprint: [[25.458, 82.777], [25.466, 82.791], [25.46, 82.803], [25.45, 82.796], [25.451, 82.783]] },
    elevated: { label: 'Elevated', populationAtRisk: '2,340', riskLevel: 'HIGH', riskTone: 'warning', redZone: 'Expanded', shelterNeed: 'NO', action: 'PREPARE EVACUATION', status: 'ELEVATED RISK', insight: 'Risk footprint is expanding. Prepare relocation resources for high-exposure habitations.', footprint: [[25.463, 82.764], [25.477, 82.793], [25.463, 82.815], [25.445, 82.8], [25.448, 82.775]] },
    severe: { label: 'Severe', populationAtRisk: '3,850', riskLevel: 'CRITICAL', riskTone: 'critical', redZone: 'Significantly Expanded', shelterNeed: 'YES', action: 'EVACUATE', status: 'CRITICAL RISK', insight: 'Projected exposure exceeds current shelter capacity. Additional relocation capacity is required.', footprint: [[25.477, 82.751], [25.491, 82.793], [25.473, 82.827], [25.438, 82.817], [25.436, 82.774]] },
  },
};

export default floodData;

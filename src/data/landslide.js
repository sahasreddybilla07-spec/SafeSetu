const landslideData = {
  id: 'landslide',
  name: 'Landslide',
  location: 'Kotwa Hills',
  center: [25.493, 82.867],
  zoom: 13,
  riskLevel: 'MODERATE',
  riskTone: 'warning',
  populationAtRisk: '3,120',
  vulnerablePopulation: '705',
  zones: [
    { id: 'kotwa-habitation', label: 'Kotwa Hills Habitation', risk: 'High Risk', color: '#c63737', positions: [[25.496, 82.836], [25.512, 82.857], [25.502, 82.881], [25.482, 82.875], [25.482, 82.852]] },
    { id: 'devgarh', label: 'Devgarh Approach', risk: 'Moderate Risk', color: '#e07b25', positions: [[25.518, 82.873], [25.532, 82.895], [25.519, 82.916], [25.502, 82.9], [25.505, 82.88]] },
    { id: 'bhairavpur', label: 'Bhairavpur Safe Area', risk: 'Safe Area', color: '#2d8a5a', positions: [[25.469, 82.884], [25.482, 82.907], [25.468, 82.928], [25.45, 82.91], [25.454, 82.891]] },
  ],
  places: [
    { name: 'Kotwa Hills habitation', position: [25.495, 82.861], color: '#c63737' },
    { name: 'Devgarh', position: [25.518, 82.895], color: '#e07b25' },
    { name: 'Bhairavpur', position: [25.468, 82.91], color: '#2d8a5a' },
  ],
  shelters: [
    { name: 'Shelter C · Kotwa Panchayat Hall', position: [25.484, 82.879], capacity: '380 people' },
    { name: 'Shelter D · Bhairavpur School', position: [25.467, 82.908], capacity: '520 people' },
  ],
  route: [[25.495, 82.86], [25.491, 82.867], [25.487, 82.873], [25.484, 82.879]],
  riskDrivers: [{ label: 'Slope', level: 'HIGH' }, { label: 'Rainfall', level: 'HIGH' }, { label: 'Soil Stability', level: 'MODERATE' }, { label: 'Road Access', level: 'HIGH' }],
  vulnerability: [{ label: 'Children', value: '468' }, { label: 'Elderly', value: '214' }, { label: 'Persons requiring assistance', value: '91' }],
  populationPoints: [[25.495, 82.859], [25.503, 82.865], [25.49, 82.85]],
  vulnerabilityPoints: [[25.498, 82.868], [25.486, 82.857]],
  action: 'RELOCATION ADVISED',
  reason: 'Slope instability and rainfall are affecting the main hill approach.',
  roadStatus: [{ label: 'MAIN HILL ROAD', value: 'BLOCKED', tone: 'critical' }, { label: 'ALTERNATE ROAD', value: 'AVAILABLE', tone: 'safe' }],
  relocation: {
    requiredPopulation: '2,100',
    vulnerablePopulation: '705',
    selectedHabitation: 'Kotwa Hills',
    recommendedShelter: 'Shelter C',
    additionalDistance: '+0 km',
    explanation: 'Shelter C has sufficient capacity, sits outside the landslide risk zone, and remains reachable through the available alternate road.',
    shelterOptions: [
      { id: 'c', name: 'Shelter C', type: 'Kotwa Panchayat Relief Centre', capacity: '2,800', available: '2,800', distance: '5.5 km', exposure: 'SAFE', accessibility: 'GOOD', vulnerabilitySupport: 'AVAILABLE', status: 'RECOMMENDED', recommended: true },
      { id: 'd', name: 'Shelter D', type: 'Bhairavpur School Relief Centre', capacity: '3,000', available: '3,000', distance: '12 km', exposure: 'SAFE', accessibility: 'GOOD', vulnerabilitySupport: 'AVAILABLE', status: 'ALTERNATE OPTION', recommended: false },
    ],
    capacity: { shelter: 'Shelter C', required: 2100, total: 2800, remaining: 700 },
    routeInfo: { origin: 'Kotwa Hills', destination: 'Shelter C', direct: 'BLOCKED · MAIN HILL ROAD', alternate: 'RECOMMENDED · ALTERNATE ROAD' },
  },
  whatIf: {
    normal: { label: 'Normal', populationAtRisk: '1,560', riskLevel: 'LOW', riskTone: 'safe', redZone: 'Limited', shelterNeed: 'NO', action: 'MONITOR SLOPE', status: 'STABLE', insight: 'Stable slope conditions. Continue rainfall and soil-stability monitoring.', footprint: [[25.495, 82.846], [25.504, 82.86], [25.498, 82.873], [25.485, 82.868], [25.486, 82.853]] },
    elevated: { label: 'Elevated', populationAtRisk: '3,120', riskLevel: 'MODERATE', riskTone: 'warning', redZone: 'Expanded', shelterNeed: 'NO', action: 'PREPARE RELOCATION', status: 'ELEVATED RISK', insight: 'Increased slope instability risk. Prepare alternate road and relocation resources.', footprint: [[25.496, 82.836], [25.512, 82.857], [25.502, 82.881], [25.482, 82.875], [25.482, 82.852]] },
    severe: { label: 'Severe', populationAtRisk: '4,260', riskLevel: 'CRITICAL', riskTone: 'critical', redZone: 'Significantly Expanded', shelterNeed: 'YES', action: 'EVACUATE HILLSIDE', status: 'CRITICAL RISK', insight: 'High landslide probability and possible road disruption. Additional relocation capacity is required.', footprint: [[25.505, 82.824], [25.527, 82.854], [25.51, 82.892], [25.472, 82.882], [25.473, 82.845]] },
  },
};

export default landslideData;

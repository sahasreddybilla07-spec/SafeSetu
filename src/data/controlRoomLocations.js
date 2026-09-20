// Static prototype data for the Control Room landing page and the
// Location Command Centre page. `hazardId` maps 1:1 to the hazard records
// in governmentDemo.js so that relocation-centre counts stay live and
// clicking through to the command centre lands on the correct hazard.
export const controlRoomLocations = [
  {
    hazardId: 'odisha-cyclone-demo',
    location: 'Puri, Odisha',
    district: 'Puri District',
    state: 'Odisha',
    hazardType: 'Cyclone',
    severity: 'CRITICAL',
    affectedAreaKm2: 428,
    peopleAtRisk: 8450,
    peopleEvacuated: 4280,
    peopleWithoutSafeRoute: 326,
    hazardRadiusKm: 65,
    parameters: [
      { label: 'Wind Speed', value: '145 km/h' },
      { label: 'Rainfall', value: '210 mm' },
      { label: 'Storm Surge', value: '2.8 m' },
    ],
    hazardParameters: [
      { label: 'Wind Speed', value: '145 km/h' },
      { label: 'Rainfall', value: '210 mm' },
      { label: 'Storm Surge', value: '2.8 m' },
      { label: 'Atmospheric Pressure', value: '972 hPa' },
      { label: 'Hazard Radius', value: '65 km' },
    ],
    staticActions: [
      { text: 'Water supply requires monitoring at 2 relief camps', tone: 'info' },
      { text: 'Road blockage reported on NH-316 evacuation route', tone: 'warning' },
    ],
  },
  {
    hazardId: 'assam-flood-demo',
    location: 'Assam — Brahmaputra Basin',
    district: 'Brahmaputra Basin',
    state: 'Assam',
    hazardType: 'Flood',
    severity: 'HIGH',
    affectedAreaKm2: 612,
    peopleAtRisk: 12800,
    peopleEvacuated: 6200,
    peopleWithoutSafeRoute: 184,
    hazardRadiusKm: 80,
    parameters: [
      { label: 'Water Level', value: '2.4 m above danger level' },
      { label: 'Rainfall', value: '185 mm' },
    ],
    hazardParameters: [
      { label: 'Water Level', value: '2.4 m above danger level' },
      { label: 'Rainfall', value: '185 mm' },
      { label: 'River Flow', value: '38,500 cusecs' },
      { label: 'Flooded Area', value: '612 km²' },
      { label: 'Warning Level', value: 'SEVERE' },
    ],
    staticActions: [
      { text: 'Embankment monitoring required near Majuli Causeway', tone: 'warning' },
      { text: 'Boat rescue teams requested for Dibrugarh sector', tone: 'info' },
    ],
  },
  {
    hazardId: 'uttarakhand-landslide-demo',
    location: 'Uttarakhand Hills',
    district: 'Chamoli-Rudraprayag Corridor',
    state: 'Uttarakhand',
    hazardType: 'Landslide',
    severity: 'HIGH',
    affectedAreaKm2: 96,
    peopleAtRisk: 4200,
    peopleEvacuated: 2600,
    peopleWithoutSafeRoute: 96,
    hazardRadiusKm: 40,
    parameters: [
      { label: 'Soil Saturation', value: '91%' },
      { label: 'Rainfall', value: '165 mm' },
    ],
    hazardParameters: [
      { label: 'Rainfall', value: '165 mm' },
      { label: 'Soil Saturation', value: '91%' },
      { label: 'Slope Risk', value: 'HIGH' },
      { label: 'Affected Area', value: '96 km²' },
      { label: 'Ground Stability', value: 'UNSTABLE' },
    ],
    staticActions: [
      { text: 'Slope stability recheck due at Rudraprayag sector', tone: 'warning' },
      { text: 'Helicopter standby requested for ridge-line access', tone: 'info' },
    ],
  },
  {
    hazardId: 'maharashtra-heatwave-demo',
    location: 'Maharashtra Urban Belt',
    district: 'Mumbai-Pune Industrial Corridor',
    state: 'Maharashtra',
    hazardType: 'Heatwave',
    severity: 'MODERATE',
    affectedAreaKm2: 1250,
    peopleAtRisk: 6700,
    peopleEvacuated: 3900,
    peopleWithoutSafeRoute: 72,
    hazardRadiusKm: 90,
    parameters: [
      { label: 'Temperature', value: '44°C' },
      { label: 'Heat Index', value: '49°C' },
    ],
    hazardParameters: [
      { label: 'Temperature', value: '44°C' },
      { label: 'Heat Index', value: '49°C' },
      { label: 'Duration', value: '5 days' },
      { label: 'Affected Population', value: '6,700' },
      { label: 'Warning Level', value: 'ORANGE ALERT' },
    ],
    staticActions: [
      { text: 'Cooling centre water stock running low in Nagpur', tone: 'warning' },
      { text: 'Public advisory refresh due for outdoor labour hours', tone: 'info' },
    ],
  },
  {
    hazardId: 'bihar-earthquake-demo',
    location: 'Bihar Foothills',
    district: 'Gaya-Nalanda Seismic Belt',
    state: 'Bihar',
    hazardType: 'Earthquake',
    severity: 'CRITICAL',
    affectedAreaKm2: 540,
    peopleAtRisk: 9100,
    peopleEvacuated: 5100,
    peopleWithoutSafeRoute: 143,
    hazardRadiusKm: 70,
    parameters: [
      { label: 'Magnitude', value: '6.2' },
      { label: 'Depth', value: '18 km' },
    ],
    hazardParameters: [
      { label: 'Magnitude', value: '6.2' },
      { label: 'Depth', value: '18 km' },
      { label: 'Peak Ground Acceleration', value: '0.32 g' },
      { label: 'Affected Area', value: '540 km²' },
      { label: 'Aftershock Risk', value: 'MODERATE' },
    ],
    staticActions: [
      { text: 'Structural inspection pending for 2 shelters', tone: 'warning' },
      { text: 'Medical teams requested for Nalanda sector', tone: 'info' },
    ],
  },
];

export function getControlRoomLocation(hazardId) {
  return controlRoomLocations.find((location) => location.hazardId === hazardId) ?? null;
}

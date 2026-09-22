// People / groups without a safe evacuation route, keyed by hazardId.
// Mirrors the persistence pattern used by governmentDemo.js: mock data,
// backed by localStorage, broadcasting a custom event on change so any
// mounted page can refresh.
const STORAGE_KEY = 'safesetu-unsafe-route-groups';

export const responseTeams = [
  { id: 'rescue-team-04', name: 'Rescue Team 04', personnel: 12, vehicles: 2, medicalUnits: 1 },
  { id: 'rescue-team-07', name: 'Rescue Team 07', personnel: 8, vehicles: 1, medicalUnits: 0 },
  { id: 'rescue-team-12', name: 'Rescue Team 12', personnel: 10, vehicles: 1, medicalUnits: 1 },
];

export const vehicleOptions = ['Rescue Vehicle', 'Evacuation Bus', 'Ambulance', 'Boat'];

const defaultGroups = {
  'odisha-cyclone-demo': [
    {
      id: 'puri-group-a',
      village: 'Village A',
      position: [19.77, 85.75],
      peopleCount: 86,
      riskLevel: 'HIGH',
      reason: 'Road flooded',
      nearestCentreId: 'bhubaneswar-shelter',
      requiredAssistance: 'Rescue vehicle + medical team',
    },
    {
      id: 'puri-group-b',
      village: 'Village B',
      position: [19.85, 85.90],
      peopleCount: 54,
      riskLevel: 'CRITICAL',
      reason: 'Bridge blocked',
      nearestCentreId: 'bhubaneswar-shelter',
      requiredAssistance: 'Evacuation vehicle',
    },
    {
      id: 'puri-group-c',
      village: 'Village C',
      position: [19.70, 85.80],
      peopleCount: 112,
      riskLevel: 'CRITICAL',
      reason: 'No accessible route',
      nearestCentreId: 'konark-coastal-relief-point',
      requiredAssistance: 'Rescue team + food + water',
    },
    {
      id: 'puri-group-d',
      village: 'Village D',
      position: [19.90, 85.75],
      peopleCount: 74,
      riskLevel: 'HIGH',
      reason: 'Route submerged',
      nearestCentreId: 'puri-relief-camp',
      requiredAssistance: 'Rescue vehicle + food & water',
    },
  ],
  'assam-flood-demo': [
    {
      id: 'assam-group-a',
      village: 'Village A',
      position: [27.30, 94.80],
      peopleCount: 96,
      riskLevel: 'HIGH',
      reason: 'Water level rising, road submerged',
      nearestCentreId: 'dibrugarh-relief-camp',
      requiredAssistance: 'Boat + medical team',
    },
    {
      id: 'assam-group-b',
      village: 'Village B',
      position: [26.05, 91.60],
      peopleCount: 88,
      riskLevel: 'CRITICAL',
      reason: 'Bridge washed away',
      nearestCentreId: 'guwahati-transit-shelter',
      requiredAssistance: 'Boat + evacuation vehicle',
    },
  ],
  'uttarakhand-landslide-demo': [
    {
      id: 'uttarakhand-group-a',
      village: 'Village A',
      position: [30.35, 79.42],
      peopleCount: 58,
      riskLevel: 'HIGH',
      reason: 'Landslide debris blocking road',
      nearestCentreId: 'chamoli-shelter-hub',
      requiredAssistance: 'Rescue team + heavy equipment',
    },
    {
      id: 'uttarakhand-group-b',
      village: 'Village B',
      position: [30.50, 79.55],
      peopleCount: 38,
      riskLevel: 'CRITICAL',
      reason: 'Road collapsed',
      nearestCentreId: 'joshimath-safe-area',
      requiredAssistance: 'Rescue vehicle + medical team',
    },
  ],
  'maharashtra-heatwave-demo': [
    {
      id: 'maharashtra-group-a',
      village: 'Village A',
      position: [19.10, 72.95],
      peopleCount: 44,
      riskLevel: 'MODERATE',
      reason: 'Heat exhaustion risk, no transport access',
      nearestCentreId: 'mumbai-cooling-centre',
      requiredAssistance: 'Evacuation vehicle + water',
    },
    {
      id: 'maharashtra-group-b',
      village: 'Village B',
      position: [20.55, 78.90],
      peopleCount: 28,
      riskLevel: 'HIGH',
      reason: 'Water shortage on route',
      nearestCentreId: 'nashik-health-shelter',
      requiredAssistance: 'Water tanker + medical team',
    },
  ],
  'bihar-earthquake-demo': [
    {
      id: 'bihar-group-a',
      village: 'Village A',
      position: [24.85, 85.10],
      peopleCount: 79,
      riskLevel: 'CRITICAL',
      reason: 'Structural collapse blocking road',
      nearestCentreId: 'gaya-safe-zone',
      requiredAssistance: 'Rescue team + medical team',
    },
    {
      id: 'bihar-group-b',
      village: 'Village B',
      position: [25.55, 85.20],
      peopleCount: 64,
      riskLevel: 'HIGH',
      reason: 'Bridge damaged',
      nearestCentreId: 'patna-emergency-hub',
      requiredAssistance: 'Rescue vehicle + food & water',
    },
  ],
};

function loadStore() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function saveStore(store) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('safesetu-unsafe-route-updated', { detail: store }));
}

export function getUnsafeRouteGroups(hazardId) {
  const defaults = defaultGroups[hazardId] ?? [];
  const store = loadStore();
  const saved = store[hazardId] ?? [];

  return defaults.map((group) => {
    const savedGroup = saved.find((item) => item.id === group.id);
    return {
      ...group,
      status: savedGroup?.status ?? 'UNASSIGNED',
      assignment: savedGroup?.assignment ?? null,
    };
  });
}

export function assignHelpToGroup(hazardId, groupId, assignment) {
  const store = loadStore();
  const current = store[hazardId] ?? getUnsafeRouteGroups(hazardId);

  const next = current.map((group) =>
    group.id === groupId
      ? { ...group, status: 'ASSIGNED', assignment }
      : group,
  );

  store[hazardId] = next;
  saveStore(store);
  return getUnsafeRouteGroups(hazardId);
}

// Detailed relocation-centre operations data (medical, food, water,
// essential resources, staff, live counters). Deterministically generated
// per centre on first access so numbers stay stable, then persisted to
// localStorage so officer actions (add resource, request supplies, etc.)
// stick across reloads. Mirrors the pattern used by governmentDemo.js.
const STORAGE_KEY = 'safesetu-centre-operations';

export const RESOURCE_DEFINITIONS = [
  { key: 'blankets', label: 'Blankets', unit: '' },
  { key: 'emergencyKits', label: 'Emergency Kits', unit: '' },
  { key: 'toiletsResource', label: 'Toilets', unit: '' },
  { key: 'generators', label: 'Generators', unit: '' },
  { key: 'fuel', label: 'Fuel', unit: 'L' },
  { key: 'medicalKitsResource', label: 'Medical Kits', unit: '' },
  { key: 'power', label: 'Power Backup', unit: 'kW' },
  { key: 'communication', label: 'Communication Equipment', unit: 'sets' },
];

function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededRange(id, salt, min, max) {
  const factor = (hashSeed(`${id}-${salt}`) % 1000) / 1000;
  return min + factor * (max - min);
}

export function resourceStatus(available, required) {
  if (required <= 0) return 'ADEQUATE';
  const ratio = available / required;
  if (ratio >= 1) return 'ADEQUATE';
  if (ratio >= 0.6) return 'LOW';
  return 'CRITICAL';
}

export function supplyStatus(coverageDays) {
  if (coverageDays >= 3) return 'SUFFICIENT';
  if (coverageDays >= 1.5) return 'LOW';
  return 'CRITICAL';
}

function buildDefaultOperations(area) {
  const capacity = Math.max(1, Number(area.capacity) || 1);
  const population = Math.max(0, Number(area.peoplePresent) || 0);
  const id = area.id;

  const totalBeds = area.medicalCapacity > 0 ? area.medicalCapacity : Math.max(10, Math.round(capacity * 0.04));
  const occupiedBeds = Math.min(totalBeds, Math.round(totalBeds * seededRange(id, 'beds', 0.45, 0.85)));

  const foodCoverageDays = Number(seededRange(id, 'food', 1.5, 4).toFixed(1));
  const waterCoverageDays = Number(seededRange(id, 'water', 1.5, 4).toFixed(1));

  const resourceRequirements = {
    blankets: population,
    emergencyKits: Math.ceil(population / 4),
    toiletsResource: area.toilets > 0 ? area.toilets : Math.ceil(capacity / 50),
    generators: Math.max(1, Math.ceil(capacity / 500)),
    fuel: Math.max(50, Math.ceil(capacity / 500) * 60),
    medicalKitsResource: Math.max(10, Math.ceil(population / 15)),
    power: Math.max(5, Math.ceil(capacity / 50)),
    communication: Math.max(2, Math.ceil(capacity / 200)),
  };

  const resources = RESOURCE_DEFINITIONS.map((def) => {
    const required = resourceRequirements[def.key];
    const available = Math.max(0, Math.round(required * seededRange(id, def.key, 0.55, 1.25)));
    return { ...def, required, available, status: resourceStatus(available, required) };
  });

  return {
    medical: {
      totalBeds,
      occupiedBeds,
      doctors: Math.max(2, Math.round(totalBeds / 7)),
      nurses: Math.max(4, Math.round(totalBeds / 3.5)),
      ambulances: Math.max(1, Math.round(totalBeds / 15)),
      medicalKits: Math.max(20, Math.round(capacity / 10)),
      criticalPatients: Math.max(0, Math.round(occupiedBeds * 0.16)),
    },
    food: {
      availableStock: Math.round(population * 3 * foodCoverageDays),
    },
    water: {
      availableStock: Math.round(population * 12 * waterCoverageDays),
    },
    resources,
    staff: {
      volunteers: Math.max(5, Math.round(capacity / 20)),
      security: Math.max(3, Math.round(capacity / 60)),
      emergencyResponsePersonnel: Math.max(2, Math.round(capacity / 100)),
    },
    incomingToday: Math.max(0, Math.round(population * seededRange(id, 'incoming', 0.04, 0.12))),
    transferredOutToday: Math.max(0, Math.round(population * seededRange(id, 'outgoing', 0.01, 0.05))),
    evacuatedToday: Math.max(0, Math.round(population * seededRange(id, 'evacuated', 0.05, 0.13))),
    medicalEmergenciesToday: Math.max(0, Math.round(seededRange(id, 'emergencies', 0, 4))),
    requestLog: [],
  };
}

function loadStore() {
  if (typeof window === 'undefined') return {};
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function writeStore(store) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function saveStore(store) {
  writeStore(store);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('safesetu-centre-ops-updated', { detail: store }));
  }
}

export function getCentreOperations(area) {
  const store = loadStore();
  const existing = store[area.id];

  if (existing) {
    return existing;
  }

  const generated = buildDefaultOperations(area);
  store[area.id] = generated;
  writeStore(store);
  return generated;
}

function updateOperations(centreId, updater) {
  const store = loadStore();
  const current = store[centreId];
  if (!current) return null;

  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  store[centreId] = next;
  saveStore(store);
  return next;
}

export function addResourceStock(centreId, resourceKey, amount) {
  return updateOperations(centreId, (current) => ({
    ...current,
    resources: current.resources.map((resource) =>
      resource.key === resourceKey
        ? {
            ...resource,
            available: resource.available + Math.max(0, amount),
            status: resourceStatus(resource.available + Math.max(0, amount), resource.required),
          }
        : resource,
    ),
  }));
}

export function requestFoodSupply(centreId, amount) {
  return updateOperations(centreId, (current) => ({
    ...current,
    food: { ...current.food, availableStock: current.food.availableStock + Math.max(0, amount) },
  }));
}

export function requestWaterSupply(centreId, amount) {
  return updateOperations(centreId, (current) => ({
    ...current,
    water: { ...current.water, availableStock: current.water.availableStock + Math.max(0, amount) },
  }));
}

export function requestMedicalSupport(centreId, note) {
  return updateOperations(centreId, (current) => ({
    ...current,
    medicalEmergenciesToday: current.medicalEmergenciesToday + 1,
    requestLog: [{ type: 'MEDICAL SUPPORT', note, time: new Date().toISOString() }, ...current.requestLog].slice(0, 10),
  }));
}

export function recordIncoming(centreId, count) {
  return updateOperations(centreId, (current) => ({
    ...current,
    incomingToday: current.incomingToday + Math.max(0, count),
    evacuatedToday: current.evacuatedToday + Math.max(0, count),
  }));
}

export function recordTransferOut(centreId, count) {
  return updateOperations(centreId, (current) => ({
    ...current,
    transferredOutToday: current.transferredOutToday + Math.max(0, count),
  }));
}

// Cross-cutting situational-awareness snapshot for a single centre, used to
// drive both the operations page and the command centre's Action Required feed.
export function getCentreStatusSummary(area) {
  const operations = getCentreOperations(area);
  const population = Math.max(0, Number(area.peoplePresent) || 0);

  const foodDailyRequirement = population * 3;
  const foodCoverageDays = foodDailyRequirement > 0 ? Number((operations.food.availableStock / foodDailyRequirement).toFixed(1)) : 0;

  const waterDailyRequirement = population * 12;
  const waterCoverageDays = waterDailyRequirement > 0 ? Number((operations.water.availableStock / waterDailyRequirement).toFixed(1)) : 0;

  const bedOccupancyPct = operations.medical.totalBeds > 0
    ? Math.round((operations.medical.occupiedBeds / operations.medical.totalBeds) * 100)
    : 0;
  const medicalStatus = bedOccupancyPct >= 90 ? 'CRITICAL' : bedOccupancyPct >= 75 ? 'STRAINED' : 'ADEQUATE';

  return {
    operations,
    foodDailyRequirement,
    foodCoverageDays,
    foodStatus: supplyStatus(foodCoverageDays),
    waterDailyRequirement,
    waterCoverageDays,
    waterStatus: supplyStatus(waterCoverageDays),
    bedOccupancyPct,
    medicalStatus,
    resourceAlerts: operations.resources.filter((resource) => resource.status !== 'ADEQUATE').length,
  };
}

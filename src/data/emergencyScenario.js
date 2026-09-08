export const scenario = {
  id: 'hyderabad-cyclone',
  hazard: 'Cyclone',
  hazardLabel: 'Cyclone / Severe Cyclonic Weather',
  location: 'Hyderabad District',
  severity: 'CRITICAL',
  affectedPopulation: '18,500',
  vulnerablePopulation: '4,200',
  status: 'EVACUATION REQUIRED',
  center: [17.385, 78.4867],
  zoom: 11,
  affectedZone: { center: [17.385, 78.4867], radius: 6500 },
};

export const evacuationPlans = [
  {
    id: 'plan-a',
    name: 'PLAN A — RAPID EVACUATION',
    departure: '15:00 IST',
    destination: 'Hyderabad Emergency Shelter A',
    route: 'NH-44 → Inner Ring Road',
    travelTime: '32 minutes',
    capacity: '20,000',
    risk: 'LOW',
    riskTone: 'safe',
    status: 'RECOMMENDED',
    recommended: true,
    recommendedReason: 'Shelter A has sufficient capacity, low route risk and the earliest viable evacuation window.',
    shelterPosition: [17.45, 78.55],
    routePositions: [[17.385, 78.4867], [17.41, 78.5], [17.43, 78.53], [17.45, 78.55]],
  },
  {
    id: 'plan-b',
    name: 'PLAN B — ALTERNATE ROUTE',
    departure: '15:20 IST',
    destination: 'Hyderabad Emergency Shelter B',
    route: 'Outer Ring Road',
    travelTime: '41 minutes',
    capacity: '15,000',
    risk: 'LOW',
    riskTone: 'safe',
    status: null,
    recommended: false,
    shelterPosition: [17.53, 78.39],
    routePositions: [[17.385, 78.4867], [17.44, 78.42], [17.49, 78.4], [17.53, 78.39]],
  },
  {
    id: 'plan-c',
    name: 'PLAN C — SECONDARY SHELTER',
    departure: '15:00 IST',
    destination: 'Community Relief Centre C',
    route: 'Local arterial roads',
    travelTime: '27 minutes',
    capacity: '12,000',
    risk: 'MODERATE',
    riskTone: 'warning',
    status: null,
    recommended: false,
    shelterPosition: [17.33, 78.47],
    routePositions: [[17.385, 78.4867], [17.36, 78.47], [17.33, 78.47]],
  },
];

export function getPlanById(id) {
  return evacuationPlans.find((plan) => plan.id === id) || null;
}

const ISSUED_PLAN_KEY = 'safesetu:issuedEvacuationPlan';
const SAFETY_STATUS_KEY = 'safesetu:emergencySafetyStatus';

export function saveIssuedPlan(planId) {
  const record = { planId, scenarioId: scenario.id, issuedAt: new Date().toISOString() };
  localStorage.setItem(ISSUED_PLAN_KEY, JSON.stringify(record));
  return record;
}

export function readIssuedPlan() {
  try {
    const raw = localStorage.getItem(ISSUED_PLAN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearIssuedPlan() {
  localStorage.removeItem(ISSUED_PLAN_KEY);
  localStorage.removeItem(SAFETY_STATUS_KEY);
}

export function saveSafetyConfirmed() {
  const record = { confirmed: true, confirmedAt: new Date().toISOString() };
  localStorage.setItem(SAFETY_STATUS_KEY, JSON.stringify(record));
  return record;
}

export function readSafetyConfirmed() {
  try {
    const raw = localStorage.getItem(SAFETY_STATUS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

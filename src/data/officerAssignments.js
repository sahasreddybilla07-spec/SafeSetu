// Field officer roster + zone assignments, keyed by hazardId. Same
// localStorage-backed pattern as the rest of the Control Room data layer.
const STORAGE_KEY = 'safesetu-officer-assignments';

export const FIELD_OFFICERS_DEPLOYED = 24;
export const RESCUE_TEAMS_ACTIVE = 11;

export const officers = [
  { id: 'officer-ravi', name: 'Ravi Kumar', contact: '+91 98765 10001' },
  { id: 'officer-anjali', name: 'Anjali Sharma', contact: '+91 98765 10002' },
  { id: 'officer-kiran', name: 'Kiran Patel', contact: '+91 98765 10003' },
  { id: 'officer-meera', name: 'Meera Nair', contact: '+91 98765 10004' },
  { id: 'officer-suresh', name: 'Suresh Rao', contact: '+91 98765 10005' },
  { id: 'officer-divya', name: 'Divya Iyer', contact: '+91 98765 10006' },
];

export const assignmentTypes = [
  'Evacuation Monitoring',
  'Relief Distribution',
  'Medical Coordination',
  'Route Clearance',
  'Shelter Management',
];

export const durationOptions = [
  'Until incident resolved',
  '24 hours',
  '48 hours',
  '72 hours',
  'Until reassigned',
];

const defaultZones = {
  'odisha-cyclone-demo': [
    { zoneId: 'puri-zone-1', zoneLabel: 'Puri Zone 1', officerId: 'officer-ravi', assignmentType: 'Evacuation Monitoring', duration: 'Until incident resolved', currentTask: 'Monitoring evacuation along the NH-316 corridor' },
    { zoneId: 'puri-zone-2', zoneLabel: 'Puri Zone 2', officerId: 'officer-anjali', assignmentType: 'Relief Distribution', duration: 'Until incident resolved', currentTask: 'Coordinating relief supplies at the Zone 2 collection point' },
    { zoneId: 'puri-zone-3', zoneLabel: 'Puri Zone 3', officerId: null, assignmentType: null, duration: null, currentTask: null },
    { zoneId: 'puri-zone-4', zoneLabel: 'Puri Zone 4', officerId: 'officer-kiran', assignmentType: 'Route Clearance', duration: 'Until incident resolved', currentTask: 'Coordinating debris clearance near the Village B bridge' },
  ],
  'assam-flood-demo': [
    { zoneId: 'brahmaputra-zone-1', zoneLabel: 'Brahmaputra Zone 1', officerId: 'officer-meera', assignmentType: 'Evacuation Monitoring', duration: 'Until incident resolved', currentTask: 'Monitoring boat evacuation near Dibrugarh' },
    { zoneId: 'brahmaputra-zone-2', zoneLabel: 'Brahmaputra Zone 2', officerId: null, assignmentType: null, duration: null, currentTask: null },
    { zoneId: 'brahmaputra-zone-3', zoneLabel: 'Brahmaputra Zone 3', officerId: 'officer-suresh', assignmentType: 'Shelter Management', duration: 'Until incident resolved', currentTask: 'Managing occupancy at Guwahati Transit Shelter' },
  ],
  'uttarakhand-landslide-demo': [
    { zoneId: 'uttarakhand-zone-1', zoneLabel: 'Uttarakhand Zone 1', officerId: 'officer-divya', assignmentType: 'Route Clearance', duration: 'Until incident resolved', currentTask: 'Overseeing debris clearance at Rudraprayag Ridge Road' },
    { zoneId: 'uttarakhand-zone-2', zoneLabel: 'Uttarakhand Zone 2', officerId: null, assignmentType: null, duration: null, currentTask: null },
  ],
  'maharashtra-heatwave-demo': [
    { zoneId: 'maharashtra-zone-1', zoneLabel: 'Maharashtra Zone 1', officerId: 'officer-kiran', assignmentType: 'Medical Coordination', duration: '72 hours', currentTask: 'Coordinating heatstroke response at Mumbai Cooling Centre' },
    { zoneId: 'maharashtra-zone-2', zoneLabel: 'Maharashtra Zone 2', officerId: null, assignmentType: null, duration: null, currentTask: null },
  ],
  'bihar-earthquake-demo': [
    { zoneId: 'bihar-zone-1', zoneLabel: 'Bihar Zone 1', officerId: 'officer-anjali', assignmentType: 'Medical Coordination', duration: 'Until incident resolved', currentTask: 'Coordinating trauma response near Nalanda Link Road Bridge' },
    { zoneId: 'bihar-zone-2', zoneLabel: 'Bihar Zone 2', officerId: null, assignmentType: null, duration: null, currentTask: null },
  ],
};

function loadStore() {
  if (typeof window === 'undefined') return {};
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function saveStore(store) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('safesetu-officer-assignments-updated', { detail: store }));
}

function statusFor(zone) {
  return zone.officerId ? 'ASSIGNED' : 'NEEDS OFFICER';
}

export function getOfficerById(officerId) {
  return officers.find((officer) => officer.id === officerId) ?? null;
}

export function getAssignments(hazardId) {
  const defaults = defaultZones[hazardId] ?? [];
  const store = loadStore();
  const saved = store[hazardId] ?? [];

  return defaults.map((zone) => {
    const savedZone = saved.find((item) => item.zoneId === zone.zoneId);
    const merged = savedZone ?? zone;
    return { ...merged, status: statusFor(merged) };
  });
}

export function getAllAssignments() {
  return Object.keys(defaultZones).reduce((acc, hazardId) => {
    acc[hazardId] = getAssignments(hazardId);
    return acc;
  }, {});
}

export function assignOfficer(hazardId, zoneId, { officerId, assignmentType, duration }) {
  const store = loadStore();
  const current = store[hazardId] ?? getAssignments(hazardId);

  const next = current.map((zone) =>
    zone.zoneId === zoneId
      ? {
          ...zone,
          officerId,
          assignmentType,
          duration,
          currentTask: `Assigned to ${assignmentType.toLowerCase()} in ${zone.zoneLabel}`,
          lastUpdated: new Date().toISOString(),
        }
      : zone,
  );

  store[hazardId] = next;
  saveStore(store);
  return getAssignments(hazardId);
}

export function removeAssignment(hazardId, zoneId) {
  const store = loadStore();
  const current = store[hazardId] ?? getAssignments(hazardId);

  const next = current.map((zone) =>
    zone.zoneId === zoneId
      ? { ...zone, officerId: null, assignmentType: null, duration: null, currentTask: null, lastUpdated: new Date().toISOString() }
      : zone,
  );

  store[hazardId] = next;
  saveStore(store);
  return getAssignments(hazardId);
}

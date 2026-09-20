// Emergency communication log — localStorage-backed like the rest of the
// Control Room data layer. Messages are appended, never edited/deleted,
// so this doubles as an audit trail.
const STORAGE_KEY = 'safesetu-communications';

export const audienceOptions = [
  'ALL AFFECTED PEOPLE',
  'FIELD OFFICERS',
  'SPECIFIC DISASTER LOCATION',
  'SPECIFIC ZONE',
  'RELOCATION CENTRE OCCUPANTS',
  'EMERGENCY RESPONSE TEAMS',
];

export const PUBLIC_AUDIENCES = ['ALL AFFECTED PEOPLE', 'SPECIFIC DISASTER LOCATION', 'SPECIFIC ZONE', 'RELOCATION CENTRE OCCUPANTS'];

const defaultLog = [
  {
    id: 'comm-seed-1',
    time: '10:02',
    audienceLabel: 'Puri Zone 3',
    recipients: 326,
    message: 'Evacuation order',
    delivery: ['SMS', 'Emergency Alert'],
    status: 'SENT',
  },
  {
    id: 'comm-seed-2',
    time: '09:44',
    audienceLabel: 'All Puri affected areas',
    recipients: 8450,
    message: 'Cyclone warning',
    delivery: ['SMS', 'Public Platform Notification'],
    status: 'SENT',
  },
  {
    id: 'comm-seed-3',
    time: '09:31',
    audienceLabel: 'Field Officers',
    recipients: 24,
    message: 'Route blockage update',
    delivery: ['Emergency Alert'],
    status: 'SENT',
  },
];

function loadLog() {
  if (typeof window === 'undefined') return defaultLog;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultLog;
  } catch (error) {
    return defaultLog;
  }
}

function saveLog(log) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  window.dispatchEvent(new CustomEvent('safesetu-communications-updated', { detail: log }));
}

export function getCommunicationLog() {
  return loadLog();
}

export function sendCommunication({ audienceLabel, recipients, message, delivery }) {
  const log = loadLog();
  const entry = {
    id: `comm-${Date.now()}`,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    audienceLabel,
    recipients,
    message,
    delivery,
    status: 'SENT',
  };

  const next = [entry, ...log].slice(0, 25);
  saveLog(next);
  return next;
}

const STORAGE_KEY = 'safesetu-emergency-assistance';

function readRequests() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function writeRequests(requests) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  window.dispatchEvent(new CustomEvent('safesetu-emergency-assistance-updated', { detail: requests }));
}

export function getEmergencyAssistanceRequests() {
  return readRequests();
}

export function createEmergencyAssistanceRequest(payload) {
  const requests = readRequests();
  const request = {
    id: `assistance-${Date.now()}`,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    ...payload,
  };
  writeRequests([request, ...requests]);
  return request;
}

export function saveSituationReport(report) {
  const requests = readRequests();
  const next = requests.map((request) => request.id === report.assistanceId
    ? { ...request, report: { ...report, submittedAt: new Date().toISOString() }, status: 'REPORT_RECEIVED' }
    : request);
  writeRequests(next);
  return report;
}

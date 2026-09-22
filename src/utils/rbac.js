export const ROLE_CONFIG = {
  national: {
    label: 'India-wide Monitoring Officer',
    scopeLabel: 'National coverage',
    description: 'Monitor hazards and resources across India, review national incidents, and coordinate public communication.',
    officialId: 'national-officer',
    password: 'national123',
    dashboardPath: '/government/national-dashboard',
    allowedNav: ['overview', 'centres', 'resources', 'comms', 'history'],
    actions: ['view-national', 'review-centres', 'view-resources', 'send-alerts', 'view-history'],
  },
  state: {
    label: 'State Monitoring Officer',
    scopeLabel: 'State-level coordination',
    description: 'Coordinate state hazards, review relocation readiness, manage state resources, and issue alerts.',
    officialId: 'state-officer',
    password: 'state123',
    dashboardPath: '/government/state-dashboard',
    allowedNav: ['overview', 'centres', 'resources', 'comms', 'history'],
    actions: ['view-state', 'review-centres', 'view-resources', 'send-alerts', 'view-history'],
  },
  district: {
    label: 'District Monitoring Officer',
    scopeLabel: 'District-level response',
    description: 'Assign field officers, allocate supplies, manage local safe routes, and coordinate district response.',
    officialId: 'district-officer',
    password: 'district123',
    dashboardPath: '/government/district-dashboard',
    allowedNav: ['overview', 'officers', 'centres', 'unsafe', 'resources', 'comms', 'history'],
    actions: ['view-district', 'assign-officers', 'review-centres', 'manage-routes', 'manage-resources', 'send-alerts', 'view-history'],
  },
};

export function getCurrentGovernmentRole() {
  if (typeof window === 'undefined') return null;
  const role = window.localStorage.getItem('safesetu-gov-role');
  return ROLE_CONFIG[role] ? role : null;
}

export function getRoleConfig(role = getCurrentGovernmentRole()) {
  return ROLE_CONFIG[role] ?? null;
}

export function hasPermission(permission, role = getCurrentGovernmentRole()) {
  return Boolean(getRoleConfig(role)?.actions.includes(permission));
}

export function isGovernmentAuthenticated() {
  return typeof window !== 'undefined' && window.localStorage.getItem('safesetu-gov-auth') === 'true' && Boolean(getCurrentGovernmentRole());
}

export function clearGovernmentSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('safesetu-gov-auth');
  window.localStorage.removeItem('safesetu-gov-official');
  window.localStorage.removeItem('safesetu-gov-role');
}

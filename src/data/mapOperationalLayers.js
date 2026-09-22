// Mock operational map-layer data (blocked roads, response-team staging
// positions) keyed by hazardId, used by the Location Command Centre map.
export const blockedRoadsByHazard = {
  'odisha-cyclone-demo': [
    {
      id: 'puri-bridge-link',
      name: 'Puri–Bhubaneswar Bridge Link',
      positions: [
        [19.85, 85.90],
        [20.10, 85.85],
      ],
      reason: 'Bridge structurally unsafe after storm surge',
      affectedArea: 'Village B access corridor',
      alternativeRoute: 'Via Konark coastal bypass (adds ~25 min)',
      clearanceTime: '6–8 hours (pending engineering assessment)',
    },
  ],
  'assam-flood-demo': [
    {
      id: 'majuli-causeway',
      name: 'NH-15 Majuli Causeway',
      positions: [
        [27.30, 94.80],
        [26.95, 94.60],
      ],
      reason: 'Causeway submerged by rising river levels',
      affectedArea: 'Majuli–Dibrugarh corridor',
      alternativeRoute: 'Ferry service via Nimati Ghat',
      clearanceTime: '12–24 hours (water-level dependent)',
    },
  ],
  'uttarakhand-landslide-demo': [
    {
      id: 'rudraprayag-ridge-road',
      name: 'Rudraprayag Ridge Road',
      positions: [
        [30.50, 79.55],
        [30.28, 78.98],
      ],
      reason: 'Landslide debris blocking carriageway',
      affectedArea: 'Joshimath–Rudraprayag stretch',
      alternativeRoute: 'Chamoli bypass via NH-107',
      clearanceTime: '8–10 hours (JCB clearance underway)',
    },
  ],
  'maharashtra-heatwave-demo': [
    {
      id: 'nagpur-outer-ring-road',
      name: 'Nagpur Outer Ring Road',
      positions: [
        [20.55, 78.90],
        [21.10, 79.05],
      ],
      reason: 'Road surface damage from extreme heat',
      affectedArea: 'Nagpur transit corridor',
      alternativeRoute: 'Via Wardha Road diversion',
      clearanceTime: '4–6 hours (resurfacing in progress)',
    },
  ],
  'bihar-earthquake-demo': [
    {
      id: 'nalanda-link-bridge',
      name: 'Nalanda Link Road Bridge',
      positions: [
        [25.55, 85.20],
        [25.14, 85.44],
      ],
      reason: 'Bridge damaged by aftershocks',
      affectedArea: 'Nalanda–Patna corridor',
      alternativeRoute: 'Via Bihar Sharif detour',
      clearanceTime: '10–14 hours (structural inspection ongoing)',
    },
  ],
};

const OFFSETS = [
  [0.09, -0.07],
  [-0.08, 0.1],
  [0.05, 0.14],
];

export function getResponseTeamPositions(hazard) {
  return OFFSETS.map((offset, index) => ({
    position: [hazard.hazardCenter[0] + offset[0], hazard.hazardCenter[1] + offset[1]],
    slot: index,
  }));
}

export function getBlockedRoads(hazardId) {
  return blockedRoadsByHazard[hazardId] ?? [];
}

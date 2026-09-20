const defaultDemoState = {
  activeHazardId: 'odisha-cyclone-demo',
  hazards: [
    {
      id: 'odisha-cyclone-demo',
      type: 'Cyclone',
      name: 'Cyclone — Odisha Coast',
      severity: 'CRITICAL',
      peopleAtRisk: 8450,
      affectedPopulation: '12,460',
      affectedRegion: 'Odisha Coastal Belt',
      affectedDistricts: ['Khordha', 'Puri', 'Jagatsinghpur', 'Cuttack'],
      lastUpdated: '09 Sep 2026, 20:30 IST',
      status: 'ACTIVE',
      recommendedAction: 'EVACUATE TO APPROVED SAFE AREA',
      hazardCenter: [19.8135, 85.8312],
      hazardRadius: 130000,
      userLocation: {
        label: 'Your Location',
        position: [20.27, 85.09],
      },
      relocationAreas: [
        {
          id: 'bhubaneswar-shelter',
          name: 'Bhubaneswar Emergency Shelter',
          hazardId: 'odisha-cyclone-demo',
          distance: 42.6,
          distanceKm: 42.6,
          travelTime: '58 min',
          travelTimeMinutes: 58,
          safetyScore: 94,
          capacity: 1500,
          occupancy: 63,
          available: 555,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'HIGHLY SUITABLE',
          recommendationSummary: 'Location appears suitable for evacuation based on capacity, route safety and hazard exposure.',
          approvalStatus: 'APPROVED',
          approved: true,
          approvedBy: 'Control Room Admin',
          approvedAt: '2026-09-09T20:30:00.000Z',
          rejectedAt: null,
          routeStatus: 'Government approved for public release',
          latitude: 20.2961,
          longitude: 85.8245,
          address: 'Bhubaneswar, Odisha',
          distanceFromPopulation: '18.2 km',
          position: [20.2961, 85.8245],
          occupancyPercent: 63,
          riskTone: 'low',
          reviewNote: 'Approved by government verification workflow.',
        },
        {
          id: 'cuttack-relief-centre',
          name: 'Cuttack Relief Centre',
          hazardId: 'odisha-cyclone-demo',
          distance: 58.2,
          distanceKm: 58.2,
          travelTime: '1 hr 14 min',
          travelTimeMinutes: 74,
          safetyScore: 89,
          capacity: 2000,
          occupancy: 71,
          available: 580,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'SUITABLE',
          recommendationSummary: 'Shelter has good access and capacity but requires final government review for route clearance.',
          approvalStatus: 'REJECTED',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: '2026-09-09T20:31:00.000Z',
          routeStatus: 'Rejected and removed from public recommendations',
          latitude: 20.4625,
          longitude: 85.8828,
          address: 'Cuttack, Odisha',
          distanceFromPopulation: '24.8 km',
          position: [20.4625, 85.8828],
          occupancyPercent: 71,
          riskTone: 'low',
          reviewNote: 'Rejected after human review.',
        },
        {
          id: 'puri-relief-camp',
          name: 'Puri Government Relief Camp',
          hazardId: 'odisha-cyclone-demo',
          distance: 31.4,
          distanceKm: 31.4,
          travelTime: '46 min',
          travelTimeMinutes: 46,
          safetyScore: 76,
          capacity: 1000,
          occupancy: 82,
          available: 180,
          riskLevel: 'MODERATE',
          risk: 'MODERATE',
          roadStatus: 'OPEN',
          floodRisk: 'MODERATE',
          landslideRisk: 'LOW',
          traffic: 'HIGH',
          aiRecommendation: 'REVIEW REQUIRED',
          recommendationSummary: 'Camp is close to the affected zone and has limited remaining capacity; review recommended before public release.',
          approvalStatus: 'PENDING',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: null,
          routeStatus: 'AI recommended — awaiting government review',
          latitude: 19.8135,
          longitude: 85.8312,
          address: 'Puri, Odisha',
          distanceFromPopulation: '11.4 km',
          position: [19.8135, 85.8312],
          occupancyPercent: 82,
          riskTone: 'warning',
          reviewNote: null,
        },
        {
          id: 'konark-coastal-relief-point',
          name: 'Konark Coastal Relief Point',
          hazardId: 'odisha-cyclone-demo',
          distance: 66.8,
          distanceKm: 66.8,
          travelTime: '1 hr 32 min',
          travelTimeMinutes: 92,
          safetyScore: 87,
          capacity: 900,
          occupancy: 51,
          available: 441,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'HIGHLY SUITABLE',
          recommendationSummary: 'Konark location remains accessible with adequate spare capacity and stable roads.',
          approvalStatus: 'APPROVED',
          approved: true,
          approvedBy: 'Control Room Admin',
          approvedAt: '2026-09-09T20:42:00.000Z',
          rejectedAt: null,
          routeStatus: 'Government approved for public release',
          latitude: 19.8876,
          longitude: 86.0949,
          address: 'Konark, Odisha',
          distanceFromPopulation: '27.4 km',
          position: [19.8876, 86.0949],
          occupancyPercent: 51,
          riskTone: 'low',
          reviewNote: 'Approved by government verification workflow.',
        },
        {
          id: 'jagatsinghpur-transit-camp',
          name: 'Jagatsinghpur Transit Camp',
          hazardId: 'odisha-cyclone-demo',
          distance: 74.5,
          distanceKm: 74.5,
          travelTime: '1 hr 48 min',
          travelTimeMinutes: 108,
          safetyScore: 71,
          capacity: 1200,
          occupancy: 76,
          available: 288,
          riskLevel: 'MODERATE',
          risk: 'MODERATE',
          roadStatus: 'OPEN',
          floodRisk: 'MODERATE',
          landslideRisk: 'LOW',
          traffic: 'HIGH',
          aiRecommendation: 'REVIEW REQUIRED',
          recommendationSummary: 'Transit camp has enough capacity but needs extra route verification before public activation.',
          approvalStatus: 'PENDING',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: null,
          routeStatus: 'AI recommended — awaiting government review',
          latitude: 20.2535,
          longitude: 86.1738,
          address: 'Jagatsinghpur, Odisha',
          distanceFromPopulation: '31.2 km',
          position: [20.2535, 86.1738],
          occupancyPercent: 76,
          riskTone: 'warning',
          reviewNote: null,
        },
      ],
      alerts: [
        {
          id: 'alert-cyclone',
          severity: 'CRITICAL',
          title: 'Cyclone intensity increased',
          location: 'Odisha Coast',
          time: '20:15 IST',
        },
        {
          id: 'alert-flood',
          severity: 'HIGH',
          title: 'Flood risk increased',
          location: 'Assam / Northeast',
          time: '19:52 IST',
        },
        {
          id: 'alert-landslide',
          severity: 'MEDIUM',
          title: 'Landslide risk detected',
          location: 'Uttarakhand',
          time: '19:40 IST',
        },
      ],
      auditTrail: [
        { time: '20:27', text: 'Bhubaneswar Emergency Shelter approved', detail: 'by Control Room Admin' },
        { time: '20:24', text: 'Cuttack Relief Centre rejected', detail: 'Capacity insufficient' },
        { time: '20:18', text: 'Puri Relief Camp pending review', detail: 'Awaiting government verification' },
      ],
    },
    {
      id: 'assam-flood-demo',
      type: 'Flood',
      name: 'Flood — Assam River Basin',
      severity: 'HIGH',
      peopleAtRisk: 6120,
      affectedPopulation: '8,210',
      affectedRegion: 'Brahmaputra Valley',
      affectedDistricts: ['Dibrugarh', 'Majuli', 'Lakhimpur', 'Sivasagar'],
      lastUpdated: '09 Sep 2026, 18:45 IST',
      status: 'ACTIVE',
      recommendedAction: 'REDIRECT TO HIGH-GROUND SHELTERS',
      hazardCenter: [27.4728, 94.9120],
      hazardRadius: 98000,
      userLocation: {
        label: 'Your Location',
        position: [26.1445, 91.7362],
      },
      relocationAreas: [
        {
          id: 'dibrugarh-relief-camp',
          name: 'Dibrugarh Relief Camp',
          hazardId: 'assam-flood-demo',
          distance: 18.7,
          distanceKm: 18.7,
          travelTime: '28 min',
          travelTimeMinutes: 28,
          safetyScore: 91,
          capacity: 1300,
          occupancy: 58,
          available: 546,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'PARTIAL',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'HIGHLY SUITABLE',
          recommendationSummary: 'High-ground shelter is accessible and has sufficient free capacity.',
          approvalStatus: 'APPROVED',
          approved: true,
          approvedBy: 'Control Room Admin',
          approvedAt: '2026-09-09T18:45:00.000Z',
          rejectedAt: null,
          routeStatus: 'Government approved for public release',
          latitude: 27.4728,
          longitude: 94.9120,
          address: 'Dibrugarh, Assam',
          distanceFromPopulation: '7.8 km',
          position: [27.4728, 94.9120],
          occupancyPercent: 58,
          riskTone: 'low',
          reviewNote: 'Approved by government verification workflow.',
        },
        {
          id: 'guwahati-transit-shelter',
          name: 'Guwahati Transit Shelter',
          hazardId: 'assam-flood-demo',
          distance: 36.1,
          distanceKm: 36.1,
          travelTime: '57 min',
          travelTimeMinutes: 57,
          safetyScore: 82,
          capacity: 2000,
          occupancy: 74,
          available: 520,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'SUITABLE',
          recommendationSummary: 'This shelter has stable access and adequate capacity for evacuation support.',
          approvalStatus: 'PENDING',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: null,
          routeStatus: 'AI recommended — awaiting government review',
          latitude: 26.1445,
          longitude: 91.7362,
          address: 'Guwahati, Assam',
          distanceFromPopulation: '16.5 km',
          position: [26.1445, 91.7362],
          occupancyPercent: 74,
          riskTone: 'low',
          reviewNote: null,
        },
        {
          id: 'silchar-high-ground',
          name: 'Silchar High Ground Shelter',
          hazardId: 'assam-flood-demo',
          distance: 44.8,
          distanceKm: 44.8,
          travelTime: '1 hr 09 min',
          travelTimeMinutes: 69,
          safetyScore: 68,
          capacity: 1100,
          occupancy: 89,
          available: 121,
          riskLevel: 'MODERATE',
          risk: 'MODERATE',
          roadStatus: 'OPEN',
          floodRisk: 'MODERATE',
          landslideRisk: 'LOW',
          traffic: 'HIGH',
          aiRecommendation: 'REVIEW REQUIRED',
          recommendationSummary: 'Shelter is close to the flood belt and currently near full occupancy.',
          approvalStatus: 'REJECTED',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: '2026-09-09T18:48:00.000Z',
          routeStatus: 'Rejected and removed from public recommendations',
          latitude: 24.8333,
          longitude: 92.7789,
          address: 'Silchar, Assam',
          distanceFromPopulation: '9.1 km',
          position: [24.8333, 92.7789],
          occupancyPercent: 89,
          riskTone: 'warning',
          reviewNote: 'Rejected after human review.',
        },
        {
          id: 'barpeta-high-ground-shelter',
          name: 'Barpeta High Ground Shelter',
          hazardId: 'assam-flood-demo',
          distance: 53.1,
          distanceKm: 53.1,
          travelTime: '1 hr 11 min',
          travelTimeMinutes: 71,
          safetyScore: 90,
          capacity: 1450,
          occupancy: 46,
          available: 667,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'HIGHLY SUITABLE',
          recommendationSummary: 'High-elevation shelter has stable access and room for additional evacuees.',
          approvalStatus: 'APPROVED',
          approved: true,
          approvedBy: 'Control Room Admin',
          approvedAt: '2026-09-09T18:55:00.000Z',
          rejectedAt: null,
          routeStatus: 'Government approved for public release',
          latitude: 26.3161,
          longitude: 90.9728,
          address: 'Barpeta, Assam',
          distanceFromPopulation: '18.6 km',
          position: [26.3161, 90.9728],
          occupancyPercent: 46,
          riskTone: 'low',
          reviewNote: 'Approved by government verification workflow.',
        },
        {
          id: 'nagaon-temporary-shelter',
          name: 'Nagaon Temporary Shelter',
          hazardId: 'assam-flood-demo',
          distance: 61.9,
          distanceKm: 61.9,
          travelTime: '1 hr 25 min',
          travelTimeMinutes: 85,
          safetyScore: 78,
          capacity: 1600,
          occupancy: 69,
          available: 496,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'PARTIAL',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'HIGH',
          aiRecommendation: 'SUITABLE',
          recommendationSummary: 'Shelter is suitable but needs a final route clearance note before full activation.',
          approvalStatus: 'PENDING',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: null,
          routeStatus: 'AI recommended — awaiting government review',
          latitude: 26.3500,
          longitude: 92.6838,
          address: 'Nagaon, Assam',
          distanceFromPopulation: '22.8 km',
          position: [26.3500, 92.6838],
          occupancyPercent: 69,
          riskTone: 'low',
          reviewNote: null,
        },
      ],
      alerts: [
        {
          id: 'alert-assam-river',
          severity: 'HIGH',
          title: 'River level alert',
          location: 'Brahmaputra Basin',
          time: '18:30 IST',
        },
        {
          id: 'alert-assam-road',
          severity: 'MEDIUM',
          title: 'Road access reduced',
          location: 'Majuli Causeway',
          time: '18:05 IST',
        },
      ],
      auditTrail: [
        { time: '18:47', text: 'Dibrugarh Relief Camp approved', detail: 'by Control Room Admin' },
        { time: '18:44', text: 'Silchar High Ground Shelter rejected', detail: 'Route stability concerns' },
        { time: '18:40', text: 'Guwahati Transit Shelter pending review', detail: 'Awaiting government verification' },
      ],
    },
    {
      id: 'uttarakhand-landslide-demo',
      type: 'Landslide',
      name: 'Landslide — Uttarakhand Hills',
      severity: 'MODERATE',
      peopleAtRisk: 4100,
      affectedPopulation: '5,680',
      affectedRegion: 'Chamoli-Rudraprayag Corridor',
      affectedDistricts: ['Chamoli', 'Rudraprayag', 'Pithoragarh'],
      lastUpdated: '09 Sep 2026, 17:20 IST',
      status: 'ACTIVE',
      recommendedAction: 'MOVE TO HILL-STABLE SHELTERS',
      hazardCenter: [30.4131, 79.4934],
      hazardRadius: 87000,
      userLocation: {
        label: 'Your Location',
        position: [30.3165, 78.0322],
      },
      relocationAreas: [
        {
          id: 'chamoli-shelter-hub',
          name: 'Chamoli Shelter Hub',
          hazardId: 'uttarakhand-landslide-demo',
          distance: 22.9,
          distanceKm: 22.9,
          travelTime: '41 min',
          travelTimeMinutes: 41,
          safetyScore: 92,
          capacity: 1200,
          occupancy: 49,
          available: 612,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'LOW',
          aiRecommendation: 'HIGHLY SUITABLE',
          recommendationSummary: 'This site is stable and has spare capacity for safe relocation.',
          approvalStatus: 'APPROVED',
          approved: true,
          approvedBy: 'Control Room Admin',
          approvedAt: '2026-09-09T17:22:00.000Z',
          rejectedAt: null,
          routeStatus: 'Government approved for public release',
          latitude: 30.4131,
          longitude: 79.4934,
          address: 'Chamoli, Uttarakhand',
          distanceFromPopulation: '12.3 km',
          position: [30.4131, 79.4934],
          occupancyPercent: 49,
          riskTone: 'low',
          reviewNote: 'Approved by government verification workflow.',
        },
        {
          id: 'joshimath-safe-area',
          name: 'Joshimath Safe Area',
          hazardId: 'uttarakhand-landslide-demo',
          distance: 30.6,
          distanceKm: 30.6,
          travelTime: '50 min',
          travelTimeMinutes: 50,
          safetyScore: 81,
          capacity: 980,
          occupancy: 68,
          available: 314,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'SUITABLE',
          recommendationSummary: 'Shelter is accessible and fit for relocation with minor route monitoring.',
          approvalStatus: 'PENDING',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: null,
          routeStatus: 'AI recommended — awaiting government review',
          latitude: 30.5531,
          longitude: 79.5664,
          address: 'Joshimath, Uttarakhand',
          distanceFromPopulation: '15.2 km',
          position: [30.5531, 79.5664],
          occupancyPercent: 68,
          riskTone: 'low',
          reviewNote: null,
        },
        {
          id: 'rudraprayag-relief-point',
          name: 'Rudraprayag Relief Point',
          hazardId: 'uttarakhand-landslide-demo',
          distance: 41.4,
          distanceKm: 41.4,
          travelTime: '1 hr 08 min',
          travelTimeMinutes: 68,
          safetyScore: 64,
          capacity: 850,
          occupancy: 95,
          available: 43,
          riskLevel: 'MODERATE',
          risk: 'MODERATE',
          roadStatus: 'CLOSED',
          floodRisk: 'LOW',
          landslideRisk: 'HIGH',
          traffic: 'HIGH',
          aiRecommendation: 'REVIEW REQUIRED',
          recommendationSummary: 'Shelter is currently full and has unstable access during the ongoing landslide response.',
          approvalStatus: 'REJECTED',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: '2026-09-09T17:24:00.000Z',
          routeStatus: 'Rejected and removed from public recommendations',
          latitude: 30.2850,
          longitude: 78.9810,
          address: 'Rudraprayag, Uttarakhand',
          distanceFromPopulation: '19.4 km',
          position: [30.2850, 78.9810],
          occupancyPercent: 95,
          riskTone: 'warning',
          reviewNote: 'Rejected after human review.',
        },
        {
          id: 'karnprayag-shelter-base',
          name: 'Karnprayag Shelter Base',
          hazardId: 'uttarakhand-landslide-demo',
          distance: 48.6,
          distanceKm: 48.6,
          travelTime: '1 hr 19 min',
          travelTimeMinutes: 79,
          safetyScore: 88,
          capacity: 1325,
          occupancy: 54,
          available: 611,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'HIGHLY SUITABLE',
          recommendationSummary: 'Shelter base is stable, well spaced, and has enough capacity for nearby evacuees.',
          approvalStatus: 'APPROVED',
          approved: true,
          approvedBy: 'Control Room Admin',
          approvedAt: '2026-09-09T17:32:00.000Z',
          rejectedAt: null,
          routeStatus: 'Government approved for public release',
          latitude: 30.2661,
          longitude: 79.2049,
          address: 'Karnprayag, Uttarakhand',
          distanceFromPopulation: '22.5 km',
          position: [30.2661, 79.2049],
          occupancyPercent: 54,
          riskTone: 'low',
          reviewNote: 'Approved by government verification workflow.',
        },
        {
          id: 'munsiyari-evacuation-hub',
          name: 'Munsiyari Evacuation Hub',
          hazardId: 'uttarakhand-landslide-demo',
          distance: 56.4,
          distanceKm: 56.4,
          travelTime: '1 hr 31 min',
          travelTimeMinutes: 91,
          safetyScore: 75,
          capacity: 1180,
          occupancy: 72,
          available: 330,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'MODERATE',
          traffic: 'MODERATE',
          aiRecommendation: 'SUITABLE',
          recommendationSummary: 'Further route monitoring is required, but the hub remains a valid backup site for relocation.',
          approvalStatus: 'PENDING',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: null,
          routeStatus: 'AI recommended — awaiting government review',
          latitude: 30.0589,
          longitude: 80.1936,
          address: 'Munsiyari, Uttarakhand',
          distanceFromPopulation: '25.1 km',
          position: [30.0589, 80.1936],
          occupancyPercent: 72,
          riskTone: 'low',
          reviewNote: null,
        },
      ],
      alerts: [
        {
          id: 'alert-landslide-hill',
          severity: 'HIGH',
          title: 'Slope movement observed',
          location: 'Chamoli Sector',
          time: '17:05 IST',
        },
        {
          id: 'alert-landslide-river',
          severity: 'MEDIUM',
          title: 'Creek runoff increased',
          location: 'Rudraprayag Valley',
          time: '16:50 IST',
        },
      ],
      auditTrail: [
        { time: '17:23', text: 'Chamoli Shelter Hub approved', detail: 'by Control Room Admin' },
        { time: '17:21', text: 'Rudraprayag Relief Point rejected', detail: 'Access risk and congestion' },
        { time: '17:18', text: 'Joshimath Safe Area pending review', detail: 'Awaiting government verification' },
      ],
    },
    {
      id: 'maharashtra-heatwave-demo',
      type: 'Heatwave',
      name: 'Heatwave — Maharashtra Urban Belt',
      severity: 'HIGH',
      peopleAtRisk: 5280,
      affectedPopulation: '6,940',
      affectedRegion: 'Mumbai-Pune Industrial Corridor',
      affectedDistricts: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
      lastUpdated: '09 Sep 2026, 16:10 IST',
      status: 'ACTIVE',
      recommendedAction: 'MOVE TO COOLING CENTRES',
      hazardCenter: [19.0760, 72.8777],
      hazardRadius: 95000,
      userLocation: {
        label: 'Your Location',
        position: [18.5204, 73.8567],
      },
      relocationAreas: [
        {
          id: 'mumbai-cooling-centre',
          name: 'Mumbai Cooling Centre',
          hazardId: 'maharashtra-heatwave-demo',
          distance: 14.2,
          distanceKm: 14.2,
          travelTime: '26 min',
          travelTimeMinutes: 26,
          safetyScore: 93,
          capacity: 1700,
          occupancy: 44,
          available: 948,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'HIGHLY SUITABLE',
          recommendationSummary: 'Cooling centre has stable access and strong capacity for heatwave shelters.',
          approvalStatus: 'APPROVED',
          approved: true,
          approvedBy: 'Control Room Admin',
          approvedAt: '2026-09-09T16:12:00.000Z',
          rejectedAt: null,
          routeStatus: 'Government approved for public release',
          latitude: 19.0760,
          longitude: 72.8777,
          address: 'Mumbai, Maharashtra',
          distanceFromPopulation: '7.1 km',
          position: [19.0760, 72.8777],
          occupancyPercent: 44,
          riskTone: 'low',
          reviewNote: 'Approved by government verification workflow.',
        },
        {
          id: 'nashik-health-shelter',
          name: 'Nashik Health Shelter',
          hazardId: 'maharashtra-heatwave-demo',
          distance: 28.7,
          distanceKm: 28.7,
          travelTime: '43 min',
          travelTimeMinutes: 43,
          safetyScore: 81,
          capacity: 1200,
          occupancy: 68,
          available: 384,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'SUITABLE',
          recommendationSummary: 'Shelter is suitable but requires staffing confirmation before activation.',
          approvalStatus: 'PENDING',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: null,
          routeStatus: 'AI recommended — awaiting government review',
          latitude: 20.5937,
          longitude: 78.9629,
          address: 'Nashik, Maharashtra',
          distanceFromPopulation: '13.2 km',
          position: [20.5937, 78.9629],
          occupancyPercent: 68,
          riskTone: 'low',
          reviewNote: null,
        },
        {
          id: 'nagpur-transit-relief',
          name: 'Nagpur Transit Relief',
          hazardId: 'maharashtra-heatwave-demo',
          distance: 37.4,
          distanceKm: 37.4,
          travelTime: '59 min',
          travelTimeMinutes: 59,
          safetyScore: 69,
          capacity: 1100,
          occupancy: 91,
          available: 99,
          riskLevel: 'MODERATE',
          risk: 'MODERATE',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'HIGH',
          aiRecommendation: 'REVIEW REQUIRED',
          recommendationSummary: 'Transit relief site is near full occupancy and needs route and staffing assessment.',
          approvalStatus: 'REJECTED',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: '2026-09-09T16:18:00.000Z',
          routeStatus: 'Rejected and removed from public recommendations',
          latitude: 21.1458,
          longitude: 79.0882,
          address: 'Nagpur, Maharashtra',
          distanceFromPopulation: '16.5 km',
          position: [21.1458, 79.0882],
          occupancyPercent: 91,
          riskTone: 'warning',
          reviewNote: 'Rejected after human review.',
        },
      ],
      alerts: [
        {
          id: 'alert-heatwave-1',
          severity: 'HIGH',
          title: 'Heat index rising',
          location: 'Mumbai-Pune Corridor',
          time: '15:50 IST',
        },
        {
          id: 'alert-heatwave-2',
          severity: 'MEDIUM',
          title: 'Water support required',
          location: 'Nagpur District',
          time: '15:20 IST',
        },
      ],
      auditTrail: [
        { time: '16:12', text: 'Mumbai Cooling Centre approved', detail: 'by Control Room Admin' },
        { time: '16:10', text: 'Nagpur Transit Relief rejected', detail: 'Capacity and staffing concerns' },
        { time: '16:08', text: 'Nashik Health Shelter pending review', detail: 'Awaiting government verification' },
      ],
    },
    {
      id: 'bihar-earthquake-demo',
      type: 'Earthquake',
      name: 'Earthquake — Bihar Foothills',
      severity: 'CRITICAL',
      peopleAtRisk: 6400,
      affectedPopulation: '8,430',
      affectedRegion: 'Gaya-Nalanda Seismic Belt',
      affectedDistricts: ['Gaya', 'Nalanda', 'Patna', 'Muzaffarpur'],
      lastUpdated: '09 Sep 2026, 14:50 IST',
      status: 'ACTIVE',
      recommendedAction: 'SHIFT TO STRUCTURALLY SAFE ZONES',
      hazardCenter: [24.7958, 85.0002],
      hazardRadius: 110000,
      userLocation: {
        label: 'Your Location',
        position: [25.5941, 85.1376],
      },
      relocationAreas: [
        {
          id: 'gaya-safe-zone',
          name: 'Gaya Safe Zone',
          hazardId: 'bihar-earthquake-demo',
          distance: 18.1,
          distanceKm: 18.1,
          travelTime: '32 min',
          travelTimeMinutes: 32,
          safetyScore: 95,
          capacity: 1500,
          occupancy: 39,
          available: 915,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'LOW',
          aiRecommendation: 'HIGHLY SUITABLE',
          recommendationSummary: 'Safe zone has strong structural integrity and clear access routes.',
          approvalStatus: 'APPROVED',
          approved: true,
          approvedBy: 'Control Room Admin',
          approvedAt: '2026-09-09T14:52:00.000Z',
          rejectedAt: null,
          routeStatus: 'Government approved for public release',
          latitude: 24.7958,
          longitude: 85.0002,
          address: 'Gaya, Bihar',
          distanceFromPopulation: '9.4 km',
          position: [24.7958, 85.0002],
          occupancyPercent: 39,
          riskTone: 'low',
          reviewNote: 'Approved by government verification workflow.',
        },
        {
          id: 'patna-emergency-hub',
          name: 'Patna Emergency Hub',
          hazardId: 'bihar-earthquake-demo',
          distance: 32.5,
          distanceKm: 32.5,
          travelTime: '52 min',
          travelTimeMinutes: 52,
          safetyScore: 86,
          capacity: 1800,
          occupancy: 61,
          available: 702,
          riskLevel: 'LOW',
          risk: 'LOW',
          roadStatus: 'OPEN',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'MODERATE',
          aiRecommendation: 'SUITABLE',
          recommendationSummary: 'Emergency hub is viable and ready for additional support with final structural review.',
          approvalStatus: 'PENDING',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: null,
          routeStatus: 'AI recommended — awaiting government review',
          latitude: 25.5941,
          longitude: 85.1376,
          address: 'Patna, Bihar',
          distanceFromPopulation: '14.8 km',
          position: [25.5941, 85.1376],
          occupancyPercent: 61,
          riskTone: 'low',
          reviewNote: null,
        },
        {
          id: 'nalanda-school-shelter',
          name: 'Nalanda School Shelter',
          hazardId: 'bihar-earthquake-demo',
          distance: 41.8,
          distanceKm: 41.8,
          travelTime: '1 hr 06 min',
          travelTimeMinutes: 66,
          safetyScore: 67,
          capacity: 950,
          occupancy: 86,
          available: 129,
          riskLevel: 'MODERATE',
          risk: 'MODERATE',
          roadStatus: 'PARTIAL',
          floodRisk: 'LOW',
          landslideRisk: 'LOW',
          traffic: 'HIGH',
          aiRecommendation: 'REVIEW REQUIRED',
          recommendationSummary: 'School shelter is currently over occupied and needs a structural recheck.',
          approvalStatus: 'REJECTED',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          rejectedAt: '2026-09-09T14:58:00.000Z',
          routeStatus: 'Rejected and removed from public recommendations',
          latitude: 25.1357,
          longitude: 85.4431,
          address: 'Nalanda, Bihar',
          distanceFromPopulation: '18.2 km',
          position: [25.1357, 85.4431],
          occupancyPercent: 86,
          riskTone: 'warning',
          reviewNote: 'Rejected after human review.',
        },
      ],
      alerts: [
        {
          id: 'alert-earthquake-1',
          severity: 'CRITICAL',
          title: 'Aftershock warning',
          location: 'Gaya Seismic Belt',
          time: '14:20 IST',
        },
        {
          id: 'alert-earthquake-2',
          severity: 'HIGH',
          title: 'Road clearance needed',
          location: 'Nalanda Link Road',
          time: '14:00 IST',
        },
      ],
      auditTrail: [
        { time: '14:53', text: 'Gaya Safe Zone approved', detail: 'by Control Room Admin' },
        { time: '14:51', text: 'Nalanda School Shelter rejected', detail: 'Capacity and structural checks' },
        { time: '14:49', text: 'Patna Emergency Hub pending review', detail: 'Awaiting government verification' },
      ],
    },
  ],
};

const STORAGE_KEY = 'safesetu-hazard-demo';

function normalizeArea(area = {}) {
  const capacity = Number(area.capacity ?? 0);
  const occupancyValue = Number(area.occupancy ?? area.occupancyPercent ?? 0);
  const peoplePresent = Math.max(
    0,
    Number(area.peoplePresent ?? Math.round((occupancyValue / 100) * capacity) ?? 0),
  );
  const occupancy = capacity > 0 ? Math.min(100, Math.max(0, Math.round((peoplePresent / capacity) * 100))) : 0;

  return {
    ...area,
    capacity,
    occupancy,
    occupancyPercent: occupancy,
    peoplePresent,
    available: Math.max(0, capacity - peoplePresent),
    medicalCapacity: area.medicalCapacity ?? Math.max(5, Math.round(capacity * 0.04)),
    foodCapacity: area.foodCapacity ?? null,
    waterCapacity: area.waterCapacity ?? null,
    toilets: area.toilets ?? Math.max(4, Math.round(capacity / 60)),
    foodStatus: area.foodStatus ?? (occupancy >= 85 ? 'LOW' : occupancy >= 60 ? 'ADEQUATE' : 'SURPLUS'),
    waterStatus: area.waterStatus ?? (occupancy >= 90 ? 'LOW' : 'ADEQUATE'),
    emergencyContact: area.emergencyContact ?? '1070 · State Emergency Operations Centre',
    operationalStatus: area.operationalStatus ?? (area.approvalStatus === 'APPROVED' ? 'ACTIVE' : null),
    inactiveReason: area.inactiveReason ?? null,
    inactivatedAt: area.inactivatedAt ?? null,
  };
}

function sanitizeHazardData(hazard = {}) {
  const relocationAreas = Array.isArray(hazard.relocationAreas)
    ? hazard.relocationAreas.map((area) => normalizeArea(area))
    : [];

  return {
    ...hazard,
    peopleAtRisk: Number(hazard.peopleAtRisk ?? 0),
    hazardRadius: Number(hazard.hazardRadius ?? 0),
    relocationAreas,
    alerts: Array.isArray(hazard.alerts) ? hazard.alerts : [],
    auditTrail: Array.isArray(hazard.auditTrail) ? hazard.auditTrail : [],
  };
}

function normalizeDemoState(parsed) {
  const parsedHazards = Array.isArray(parsed?.hazards) ? parsed.hazards : [];
  const mergedHazards = (defaultDemoState.hazards ?? []).map((defaultHazard) => {
    const parsedHazard = parsedHazards.find((candidate) => candidate.id === defaultHazard.id);

    if (!parsedHazard) {
      return sanitizeHazardData(defaultHazard);
    }

    const sourceAreas = Array.isArray(parsedHazard.relocationAreas) ? parsedHazard.relocationAreas : [];
    const mergedRelocationAreas = (defaultHazard.relocationAreas ?? []).map((defaultArea) => {
      const parsedArea = sourceAreas.find((candidate) => candidate.id === defaultArea.id);
      return normalizeArea({
        ...defaultArea,
        ...(parsedArea ?? {}),
      });
    });

    const extraRelocationAreas = sourceAreas
      .filter((candidate) => !(defaultHazard.relocationAreas ?? []).some((defaultArea) => defaultArea.id === candidate.id))
      .map((area) => normalizeArea(area));

    const reconstructedHazard = sanitizeHazardData({
      ...defaultHazard,
      ...parsedHazard,
      relocationAreas: [...mergedRelocationAreas, ...extraRelocationAreas],
      alerts: Array.isArray(parsedHazard.alerts) ? parsedHazard.alerts : defaultHazard.alerts,
      auditTrail: Array.isArray(parsedHazard.auditTrail) ? parsedHazard.auditTrail : defaultHazard.auditTrail,
    });

    const defaultRejectedAreas = (defaultHazard.relocationAreas ?? []).filter((area) => area.approvalStatus === 'REJECTED');

    reconstructedHazard.relocationAreas = reconstructedHazard.relocationAreas.map((area) => {
      const defaultRejectedArea = defaultRejectedAreas.find((candidate) => candidate.id === area.id);

      if (!defaultRejectedArea) {
        return area;
      }

      return normalizeArea({
        ...defaultRejectedArea,
        ...area,
        approvalStatus: 'REJECTED',
        approved: false,
        approvedBy: null,
        approvedAt: null,
        rejectedAt: area.rejectedAt ?? defaultRejectedArea.rejectedAt ?? new Date().toISOString(),
        routeStatus: 'Rejected and removed from public recommendations',
        reviewNote: area.reviewNote ?? defaultRejectedArea.reviewNote ?? 'Rejected after human review.',
        aiRecommendation: 'REJECTED',
      });
    });

    return reconstructedHazard;
  });

  const extraHazards = parsedHazards
    .filter((candidate) => !(defaultDemoState.hazards ?? []).some((defaultHazard) => defaultHazard.id === candidate.id))
    .map((hazard) => sanitizeHazardData(hazard));

  const hazards = [...mergedHazards, ...extraHazards];
  const activeHazardId = parsed?.activeHazardId ?? hazards[0]?.id ?? defaultDemoState.activeHazardId;
  const activeHazard = hazards.find((hazard) => hazard.id === activeHazardId) ?? hazards[0] ?? sanitizeHazardData(defaultDemoState);

  return {
    ...activeHazard,
    activeHazardId: activeHazard.id,
    hazards,
  };
}

export const hazardDemoData = getHazardDemoData();

export const hazardDemoPrecautions = [
  {
    title: 'Before relocation',
    items: [
      'Monitor the active hazard zone and follow the latest control room alerts.',
      'Keep emergency contacts, medical supplies, and identification documents ready.',
      'Review nearby shelters and select the safest approved location available.',
    ],
  },
  {
    title: 'During evacuation',
    items: [
      'Move to the approved site only after confirming route instructions from the control room.',
      'Avoid low-lying roads, vulnerable bridges, and blocked corridors.',
      'Use the nearest safe route and stay with the designated relief response team.',
    ],
  },
  {
    title: 'After reaching shelter',
    items: [
      'Register your presence with the shelter desk and update occupancy details if needed.',
      'Follow local safety advisories, weather watches, and medical support instructions.',
      'Keep checking the dashboard for reallocation decisions or route changes.',
    ],
  },
];

export function getHazardDemoData() {
  if (typeof window === 'undefined') {
    return normalizeDemoState(defaultDemoState);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      activeHazardId: defaultDemoState.activeHazardId,
      hazards: defaultDemoState.hazards,
    }));
    return normalizeDemoState(defaultDemoState);
  }

  try {
    const parsed = JSON.parse(saved);
    if (!parsed || (!parsed.hazards && !parsed.relocationAreas)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        activeHazardId: defaultDemoState.activeHazardId,
        hazards: defaultDemoState.hazards,
      }));
      return normalizeDemoState(defaultDemoState);
    }

    const normalized = normalizeDemoState(parsed);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      activeHazardId: normalized.activeHazardId,
      hazards: normalized.hazards,
    }));
    return normalized;
  } catch (error) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      activeHazardId: defaultDemoState.activeHazardId,
      hazards: defaultDemoState.hazards,
    }));
    return normalizeDemoState(defaultDemoState);
  }
}

export function saveHazardDemoData(data) {
  if (typeof window === 'undefined') {
    return normalizeDemoState(data ?? defaultDemoState);
  }

  const nextState = {
    activeHazardId: data?.activeHazardId ?? data?.id ?? defaultDemoState.activeHazardId,
    hazards: Array.isArray(data?.hazards)
      ? data.hazards.map((hazard) => sanitizeHazardData(hazard))
      : [sanitizeHazardData(data)],
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new CustomEvent('safesetu-hazard-demo-updated', { detail: nextState }));
  return normalizeDemoState(nextState);
}

export function applyFieldOfficerUpdate(locationId, updates) {
  const data = getHazardDemoData();
  const activeHazard =
    data.hazards.find((item) => item.relocationAreas.some((area) => area.id === locationId)) ??
    data.hazards.find((item) => item.id === data.activeHazardId) ??
    data.hazards[0];

  if (!activeHazard) {
    return data;
  }

  const area = activeHazard.relocationAreas.find((item) => item.id === locationId);

  if (!area) {
    return data;
  }

  const nextCapacity = Math.max(0, Number(updates.capacity ?? area.capacity ?? 0));
  const nextPeoplePresent = Math.max(
    0,
    Number(updates.peoplePresent ?? area.peoplePresent ?? Math.round(((area.occupancy ?? area.occupancyPercent ?? 0) / 100) * nextCapacity) ?? 0),
  );

  const normalizedArea = {
    ...area,
    capacity: nextCapacity,
    peoplePresent: nextPeoplePresent,
    occupancy: nextCapacity > 0 ? Math.min(100, Math.max(0, Math.round((nextPeoplePresent / nextCapacity) * 100))) : 0,
    occupancyPercent: nextCapacity > 0 ? Math.min(100, Math.max(0, Math.round((nextPeoplePresent / nextCapacity) * 100))) : 0,
    available: Math.max(0, nextCapacity - nextPeoplePresent),
  };

  activeHazard.relocationAreas = activeHazard.relocationAreas.map((item) => item.id === locationId ? normalizedArea : item);
  activeHazard.lastUpdated = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  });

  const nextData = {
    activeHazardId: activeHazard.id,
    hazards: data.hazards.map((item) => item.id === activeHazard.id ? activeHazard : item),
  };

  return saveHazardDemoData(nextData);
}

export function applyLocationDecision(locationId, decision, actor = 'Control Room Admin') {
  const data = getHazardDemoData();
  const activeHazard =
    data.hazards.find((item) => item.relocationAreas.some((area) => area.id === locationId)) ??
    data.hazards.find((item) => item.id === data.activeHazardId) ??
    data.hazards[0];

  if (!activeHazard) {
    return data;
  }

  const area = activeHazard.relocationAreas.find((item) => item.id === locationId);

  if (!area) {
    return data;
  }

  const decisionValue = decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'PENDING';
  const updatedArea = {
    ...area,
    approvalStatus: decisionValue,
    approved: decisionValue === 'APPROVED',
    approvedBy: decisionValue === 'APPROVED' ? actor : null,
    approvedAt: decisionValue === 'APPROVED' ? new Date().toISOString() : null,
    rejectedAt: decisionValue === 'REJECTED' ? new Date().toISOString() : null,
    routeStatus:
      decisionValue === 'APPROVED'
        ? 'Government approved for public release'
        : decisionValue === 'REJECTED'
          ? 'Rejected and removed from public recommendations'
          : 'AI recommended — awaiting government review',
    reviewNote:
      decisionValue === 'APPROVED'
        ? `Approved by ${actor}`
        : decisionValue === 'REJECTED'
          ? 'Rejected after human review.'
          : null,
    aiRecommendation: decisionValue === 'APPROVED' ? 'GOVERNMENT APPROVED' : decisionValue === 'REJECTED' ? 'REJECTED' : area.aiRecommendation,
    operationalStatus: decisionValue === 'APPROVED' ? 'ACTIVE' : null,
    inactiveReason: decisionValue === 'APPROVED' ? null : area.inactiveReason,
    inactivatedAt: decisionValue === 'APPROVED' ? null : area.inactivatedAt,
  };

  activeHazard.relocationAreas = activeHazard.relocationAreas.map((item) => item.id === locationId ? updatedArea : item);
  activeHazard.auditTrail = [
    {
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      text: `${area.name} ${decisionValue === 'APPROVED' ? 'approved' : 'rejected'}`,
      detail: decisionValue === 'APPROVED' ? `by ${actor}` : 'Capacity and route review required',
    },
    ...activeHazard.auditTrail,
  ].slice(0, 6);

  const nextData = {
    activeHazardId: activeHazard.id,
    hazards: data.hazards.map((item) => item.id === activeHazard.id ? activeHazard : item),
  };

  return saveHazardDemoData(nextData);
}

export function createRelocationCentre(hazardId, payload = {}, { emergencyActive = false, actor = 'Control Room Admin' } = {}) {
  const data = getHazardDemoData();
  const hazard = data.hazards.find((item) => item.id === hazardId);

  if (!hazard) {
    return data;
  }

  const approvalStatus = emergencyActive ? 'APPROVED' : 'PENDING';
  const latitude = Number(payload.latitude ?? hazard.hazardCenter?.[0] ?? 0);
  const longitude = Number(payload.longitude ?? hazard.hazardCenter?.[1] ?? 0);
  const capacity = Math.max(0, Number(payload.capacity ?? 0));
  const nowIso = new Date().toISOString();

  const newArea = normalizeArea({
    id: `${hazardId}-centre-${Date.now()}`,
    name: payload.name || 'Unnamed Relocation Centre',
    hazardId,
    address: payload.location || 'Location not specified',
    latitude,
    longitude,
    position: [latitude, longitude],
    capacity,
    peoplePresent: 0,
    safetyScore: Number(payload.safetyScore ?? 70),
    distance: Number(payload.distanceKm ?? 0),
    distanceKm: Number(payload.distanceKm ?? 0),
    distanceFromPopulation: payload.distanceKm ? `${payload.distanceKm} km` : 'Unknown',
    travelTime: payload.travelTime || 'Unknown',
    riskLevel: payload.riskLevel || 'MODERATE',
    risk: payload.riskLevel || 'MODERATE',
    roadStatus: 'OPEN',
    floodRisk: 'LOW',
    landslideRisk: 'LOW',
    traffic: 'MODERATE',
    aiRecommendation: emergencyActive ? 'EMERGENCY ACTIVATION' : 'PENDING REVIEW',
    recommendationSummary: emergencyActive
      ? `Activated directly by ${actor} for immediate emergency response.`
      : 'Newly allotted centre awaiting government verification.',
    approvalStatus,
    approved: emergencyActive,
    approvedBy: emergencyActive ? actor : null,
    approvedAt: emergencyActive ? nowIso : null,
    rejectedAt: null,
    routeStatus: emergencyActive
      ? 'Government approved for public release (emergency activation)'
      : 'Newly allotted — awaiting government review',
    reviewNote: null,
    medicalCapacity: Number(payload.medicalCapacity ?? 0),
    foodCapacity: payload.foodCapacity || null,
    waterCapacity: payload.waterCapacity || null,
    toilets: Number(payload.toilets ?? 0),
    emergencyContact: payload.emergencyContact || '1070 · State Emergency Operations Centre',
    operationalStatus: emergencyActive ? 'ACTIVE' : null,
  });

  hazard.relocationAreas = [...hazard.relocationAreas, newArea];
  hazard.auditTrail = [
    {
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      text: `${newArea.name} allotted as a new relocation centre`,
      detail: emergencyActive ? `Activated immediately by ${actor}` : 'Awaiting government approval',
    },
    ...hazard.auditTrail,
  ].slice(0, 6);

  const nextData = {
    activeHazardId: data.activeHazardId,
    hazards: data.hazards.map((item) => (item.id === hazard.id ? hazard : item)),
  };

  return saveHazardDemoData(nextData);
}

export function deactivateRelocationCentre(locationId, reason, actor = 'Control Room Admin') {
  const data = getHazardDemoData();
  const hazard = data.hazards.find((item) => item.relocationAreas.some((area) => area.id === locationId));

  if (!hazard) {
    return data;
  }

  const area = hazard.relocationAreas.find((item) => item.id === locationId);

  if (!area) {
    return data;
  }

  const updatedArea = {
    ...area,
    operationalStatus: 'INACTIVE',
    inactiveReason: reason,
    inactivatedAt: new Date().toISOString(),
    routeStatus: 'Removed from active operations',
  };

  hazard.relocationAreas = hazard.relocationAreas.map((item) => (item.id === locationId ? updatedArea : item));
  hazard.auditTrail = [
    {
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      text: `${area.name} removed from active operations`,
      detail: `${reason} · by ${actor}`,
    },
    ...hazard.auditTrail,
  ].slice(0, 6);

  const nextData = {
    activeHazardId: data.activeHazardId,
    hazards: data.hazards.map((item) => (item.id === hazard.id ? hazard : item)),
  };

  return saveHazardDemoData(nextData);
}

export function getGovernmentAuditTrail() {
  const data = getHazardDemoData();
  const activeHazard = data.hazards.find((item) => item.id === data.activeHazardId) ?? data.hazards[0] ?? data;
  return Array.isArray(activeHazard.auditTrail) ? activeHazard.auditTrail : [];
}

export function getHazardDemoSummary() {
  const data = getHazardDemoData();
  const activeHazard = data.hazards.find((item) => item.id === data.activeHazardId) ?? data.hazards[0] ?? data;
  const pending = activeHazard.relocationAreas.filter((area) => area.approvalStatus === 'PENDING').length;
  const approved = activeHazard.relocationAreas.filter((area) => area.approvalStatus === 'APPROVED').length;
  const rejected = activeHazard.relocationAreas.filter((area) => area.approvalStatus === 'REJECTED').length;

  return {
    activeHazards: data.hazards.length,
    peopleAtRisk: activeHazard.peopleAtRisk,
    pendingReviewCount: pending,
    approvedSafeAreas: approved,
    pendingActions: pending,
    rejectedCount: rejected,
  };
}

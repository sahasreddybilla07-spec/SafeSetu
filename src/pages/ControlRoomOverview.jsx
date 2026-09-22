import { useEffect, useMemo, useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  MapPin,
  MessagesSquare,
  Plus,
  Send,
  ShieldAlert,
  TowerControl,
  TriangleAlert,
  UserCog,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ControlRoomSidebar from '../components/ControlRoomSidebar';
import HazardVisual from '../components/HazardVisual';
import { controlRoomLocations } from '../data/controlRoomLocations';
import { getHazardDemoData } from '../data/hazardDemo';
import { getUnsafeRouteGroups } from '../data/unsafeRouteGroups';
import { FIELD_OFFICERS_DEPLOYED, RESCUE_TEAMS_ACTIVE, getAllAssignments } from '../data/officerAssignments';
import { getCommunicationLog } from '../data/communications';
import { operationsFeed } from '../data/operationsFeed';
import { emojiFor, riskLevelFor } from '../utils/statusLevels';

const severityMeta = {
  CRITICAL: { label: 'Critical', className: 'severity-badge--critical' },
  HIGH: { label: 'High', className: 'severity-badge--high' },
  MODERATE: { label: 'Moderate', className: 'severity-badge--warning' },
};

const ROUTE_BLOCKED_PATTERN = /(block|collapse|washed away|debris)/i;

export default function ControlRoomOverview() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (localStorage.getItem('safesetu-gov-auth') !== 'true') {
      navigate('/government/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleStateUpdate = () => setRefreshKey((value) => value + 1);
    window.addEventListener('safesetu-hazard-demo-updated', handleStateUpdate);
    window.addEventListener('safesetu-unsafe-route-updated', handleStateUpdate);
    window.addEventListener('safesetu-officer-assignments-updated', handleStateUpdate);
    window.addEventListener('safesetu-communications-updated', handleStateUpdate);
    window.addEventListener('storage', handleStateUpdate);
    return () => {
      window.removeEventListener('safesetu-hazard-demo-updated', handleStateUpdate);
      window.removeEventListener('safesetu-unsafe-route-updated', handleStateUpdate);
      window.removeEventListener('safesetu-officer-assignments-updated', handleStateUpdate);
      window.removeEventListener('safesetu-communications-updated', handleStateUpdate);
      window.removeEventListener('storage', handleStateUpdate);
    };
  }, []);

  const demoData = useMemo(() => getHazardDemoData(), [refreshKey]);

  const locations = useMemo(() => {
    return controlRoomLocations.map((location) => {
      const hazard = demoData.hazards.find((item) => item.id === location.hazardId);
      const relocationAreas = hazard?.relocationAreas ?? [];
      const awaitingApproval = relocationAreas.filter((area) => area.approvalStatus === 'PENDING').length;
      const nearCapacity = relocationAreas.filter(
        (area) => area.approvalStatus === 'APPROVED' && area.operationalStatus === 'ACTIVE' && area.occupancy >= 85,
      );

      return {
        ...location,
        centreCount: relocationAreas.length,
        awaitingApproval,
        nearCapacityCentres: nearCapacity,
      };
    });
  }, [demoData]);

  const nationalSummary = useMemo(() => {
    const totalPeopleAtRisk = controlRoomLocations.reduce((sum, item) => sum + item.peopleAtRisk, 0);
    const totalWithoutSafeRoute = controlRoomLocations.reduce((sum, item) => sum + item.peopleWithoutSafeRoute, 0);
    const totalAwaitingApproval = locations.reduce((sum, item) => sum + item.awaitingApproval, 0);
    const criticalActions = locations
      .filter((item) => item.severity === 'CRITICAL')
      .reduce((sum, item) => sum + item.awaitingApproval, 0);

    return {
      activeHazardLocations: controlRoomLocations.length,
      totalPeopleAtRisk,
      totalWithoutSafeRoute,
      totalAwaitingApproval,
      criticalActions,
    };
  }, [locations]);

  const activeOperations = useMemo(() => {
    const peopleEvacuated = controlRoomLocations.reduce((sum, item) => sum + item.peopleEvacuated, 0);
    return {
      fieldOfficers: FIELD_OFFICERS_DEPLOYED,
      rescueTeams: RESCUE_TEAMS_ACTIVE,
      peopleEvacuated,
      peopleWithoutSafeRoute: nationalSummary.totalWithoutSafeRoute,
    };
  }, [nationalSummary]);

  const globalActionItems = useMemo(() => {
    const items = [];

    locations
      .filter((location) => location.peopleWithoutSafeRoute > 0)
      .forEach((location) => {
        items.push({
          id: `no-route-${location.hazardId}`,
          level: 'CRITICAL',
          text: `${location.peopleWithoutSafeRoute.toLocaleString('en-IN')} people in ${location.location.split(',')[0]} have no safe evacuation route`,
          buttonLabel: 'ASSIGN RESPONSE',
          onClick: () => navigate(`/government/control-room/hazard/${location.hazardId}`),
        });
      });

    locations.forEach((location) => {
      const groups = getUnsafeRouteGroups(location.hazardId);
      const blocked = groups.filter((group) => ROUTE_BLOCKED_PATTERN.test(group.reason));
      if (blocked.length > 0) {
        items.push({
          id: `blocked-${location.hazardId}`,
          level: 'CRITICAL',
          text: `${blocked.length} evacuation route${blocked.length > 1 ? 's' : ''} blocked near ${location.location.split(',')[0]}`,
          buttonLabel: 'VIEW MAP',
          onClick: () => navigate(`/government/control-room/hazard/${location.hazardId}`),
        });
      }
    });

    locations
      .filter((location) => location.awaitingApproval > 0)
      .forEach((location) => {
        items.push({
          id: `pending-${location.hazardId}`,
          level: 'HIGH',
          text: `${location.awaitingApproval} relocation centre${location.awaitingApproval > 1 ? 's' : ''} awaiting approval in ${location.location.split(',')[0]}`,
          buttonLabel: 'REVIEW',
          onClick: () => navigate(`/government/control-room/hazard/${location.hazardId}`),
        });
      });

    locations
      .filter((location) => location.nearCapacityCentres.length > 0)
      .forEach((location) => {
        items.push({
          id: `capacity-${location.hazardId}`,
          level: 'HIGH',
          text: `${location.nearCapacityCentres[0].name} approaching capacity`,
          buttonLabel: 'VIEW CENTRE',
          onClick: () => navigate(`/government/control-room/hazard/${location.hazardId}`),
        });
      });

    const allAssignments = getAllAssignments();
    Object.values(allAssignments).flat().filter((zone) => zone.status === 'NEEDS OFFICER').forEach((zone) => {
      items.push({
        id: `officer-${zone.zoneId}`,
        level: 'HIGH',
        text: `Field officer required in ${zone.zoneLabel}`,
        buttonLabel: 'ASSIGN OFFICER',
        onClick: () => navigate('/government/control-room/officers'),
      });
    });

    const rank = { CRITICAL: 0, HIGH: 1, MODERATE: 2 };
    return items.sort((a, b) => (rank[a.level] ?? 3) - (rank[b.level] ?? 3));
  }, [locations, navigate]);

  const recentComms = getCommunicationLog().slice(0, 3);

  function handleOpenCommandCentre(hazardId) {
    navigate(`/government/control-room/hazard/${encodeURIComponent(hazardId)}`);
  }

  return (
    <div className="crs-layout">
      <ControlRoomSidebar active="overview" />

      <main className="crs-main">
        <header className="cr-overview__header">
          <div className="cr-overview__brand">
            <img alt="" aria-hidden="true" className="cr-overview__mark" src="/safesetu-crest.png" />
            <div>
              <p className="cr-overview__eyebrow">SAFESETU</p>
              <h1>NATIONAL DISASTER CONTROL ROOM</h1>
            </div>
          </div>

          <div className="cr-overview__header-actions">
            <span className="cr-overview__status">
              <i className="cr-overview__status-dot" /> SYSTEM OPERATIONAL
            </span>
          </div>
        </header>

        <section className="cr-quick-actions" aria-label="Quick actions">
          <button onClick={() => navigate('/government/control-room/officers')} type="button">
            <Plus size={13} /> Assign Officer
          </button>
          <button onClick={() => navigate('/government/control-room/communication')} type="button">
            <Send size={13} /> Send Alert
          </button>
          <button onClick={() => handleOpenCommandCentre(controlRoomLocations[0]?.hazardId)} type="button">
            <TowerControl size={13} /> Add Relocation Centre
          </button>
          <button onClick={() => handleOpenCommandCentre(controlRoomLocations[0]?.hazardId)} type="button">
            <UserCog size={13} /> Assign Response Team
          </button>
          <button onClick={() => handleOpenCommandCentre(controlRoomLocations[0]?.hazardId)} type="button">
            <MapPin size={13} /> View Map
          </button>
        </section>

        <section className="cr-overview__summary" aria-label="National situation summary">
          <article className="cr-summary-card">
            <span className="cr-summary-card__icon"><MapPin size={16} /></span>
            <span className="cr-summary-card__label">Active Hazard Locations</span>
            <strong>{nationalSummary.activeHazardLocations}</strong>
          </article>
          <article className="cr-summary-card">
            <span className="cr-summary-card__icon"><Users size={16} /></span>
            <span className="cr-summary-card__label">Total People at Risk</span>
            <strong>{nationalSummary.totalPeopleAtRisk.toLocaleString('en-IN')}</strong>
          </article>
          <article className="cr-summary-card cr-summary-card--alert">
            <span className="cr-summary-card__icon"><ShieldAlert size={16} /></span>
            <span className="cr-summary-card__label">People Without Safe Routes</span>
            <strong>{nationalSummary.totalWithoutSafeRoute.toLocaleString('en-IN')}</strong>
          </article>
          <article className="cr-summary-card cr-summary-card--warning">
            <span className="cr-summary-card__icon"><TowerControl size={16} /></span>
            <span className="cr-summary-card__label">Centres Awaiting Approval</span>
            <strong>{nationalSummary.totalAwaitingApproval}</strong>
          </article>
          <article className="cr-summary-card cr-summary-card--critical">
            <span className="cr-summary-card__icon"><AlertOctagon size={16} /></span>
            <span className="cr-summary-card__label">Critical Actions</span>
            <strong>{nationalSummary.criticalActions}</strong>
          </article>
        </section>

        <section className="cr-overview__main" aria-label="Active hazard locations">
          <div className="cr-overview__main-heading">
            <h2>ACTIVE HAZARD LOCATIONS</h2>
            <span>{locations.length} locations currently under monitoring</span>
          </div>

          <div className="cr-location-grid">
            {locations.map((location) => {
              const severity = severityMeta[location.severity] ?? severityMeta.MODERATE;

              return (
                <article
                  className={`cr-location-card cr-location-card--${location.severity.toLowerCase()}`}
                  key={location.hazardId}
                  onClick={() => handleOpenCommandCentre(location.hazardId)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleOpenCommandCentre(location.hazardId);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open command centre for ${location.location}`}
                >
                  <HazardVisual hazardType={location.hazardType} />
                  <div className="cr-location-card__banner-label">
                    <TriangleAlert size={13} />
                    <span>{location.hazardType.toUpperCase()}</span>
                  </div>

                  <div className="cr-location-card__body">
                    <div className="cr-location-card__top">
                      <h3>{location.location}</h3>
                      <span className={`severity-badge ${severity.className}`}>
                        {emojiFor(riskLevelFor(location.severity))} {severity.label}
                      </span>
                    </div>

                    <dl className="cr-location-card__params">
                      {location.parameters.map((param) => (
                        <div key={param.label}>
                          <dt>{param.label}</dt>
                          <dd>{param.value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="cr-location-card__stats">
                      <div>
                        <span>People at Risk</span>
                        <strong>{location.peopleAtRisk.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span>Without Safe Route</span>
                        <strong className="cr-location-card__stat-alert">{location.peopleWithoutSafeRoute.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span>Relocation Centres</span>
                        <strong>{location.centreCount}</strong>
                      </div>
                      <div>
                        <span>Awaiting Approval</span>
                        <strong className={location.awaitingApproval > 0 ? 'cr-location-card__stat-warning' : ''}>
                          {location.awaitingApproval}
                        </strong>
                      </div>
                    </div>

                    <button
                      className="cr-location-card__cta"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenCommandCentre(location.hazardId);
                      }}
                      type="button"
                    >
                      OPEN COMMAND CENTRE <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="cr-ops-grid">
          <section className="lcc-panel cr-active-ops">
            <div className="lcc-panel__heading">
              <p>LIVE OPERATIONS</p>
              <h3>ACTIVE OPERATIONS</h3>
            </div>
            <div className="cr-active-ops__stats">
              <div>
                <span>Field Officers Deployed</span>
                <strong>{activeOperations.fieldOfficers}</strong>
              </div>
              <div>
                <span>Rescue Teams Active</span>
                <strong>{activeOperations.rescueTeams}</strong>
              </div>
              <div>
                <span>People Being Evacuated</span>
                <strong>{activeOperations.peopleEvacuated.toLocaleString('en-IN')}</strong>
              </div>
              <div className="cr-active-ops__stat-alert">
                <span>People Without Safe Routes</span>
                <strong>{activeOperations.peopleWithoutSafeRoute.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="cr-ops-feed">
              {operationsFeed.map((entry, index) => (
                <div className="cr-ops-feed__item" key={`${entry.time}-${index}`}>
                  <span className="cr-ops-feed__time">{entry.time}</span>
                  <span className="cr-ops-feed__text">{entry.text}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="lcc-panel lcc-priority-panel cr-action-required">
            <div className="lcc-panel__heading">
              <p>ACTION REQUIRED</p>
              <h3>What needs the officer's attention right now</h3>
            </div>
            <div className="lcc-action-list">
              {globalActionItems.length === 0 ? (
                <div className="empty-state">🟢 No pending actions across active hazards.</div>
              ) : (
                globalActionItems.map((item) => (
                  <div className={`lcc-action-item lcc-action-item--${item.level === 'CRITICAL' ? 'critical' : 'warning'}`} key={item.id}>
                    <span className="lcc-action-item__icon">
                      {item.level === 'CRITICAL' ? <ShieldAlert size={16} /> : <AlertOctagon size={16} />}
                    </span>
                    <span className="lcc-action-item__text">{emojiFor(item.level)} {item.text}</span>
                    <button className="lcc-action-item__button" onClick={item.onClick} type="button">
                      {item.buttonLabel}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="lcc-panel cr-recent-comms">
          <div className="lcc-panel__heading cr-recent-comms__heading">
            <div>
              <p>COMMUNICATION</p>
              <h3><MessagesSquare size={15} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />Recent communications</h3>
            </div>
            <button className="control-room-secondary-button cr-recent-comms__link" onClick={() => navigate('/government/control-room/communication')} type="button">
              OPEN COMMUNICATION CENTRE
            </button>
          </div>
          <div className="comm-history comm-history--compact">
            {recentComms.map((entry) => (
              <div className="comm-history__item" key={entry.id}>
                <span className="comm-history__time">{entry.time}</span>
                <span className="comm-history__audience">{entry.audienceLabel}</span>
                <span className="comm-history__recipients">{entry.recipients.toLocaleString('en-IN')} recipients</span>
                <span className="comm-history__message">{entry.message}</span>
                <span className="uwr-status uwr-status--assigned">🟢 {entry.status}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

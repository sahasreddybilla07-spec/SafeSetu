import { useEffect, useMemo, useState } from 'react';
import { MessagesSquare, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ControlRoomSidebar from '../components/ControlRoomSidebar';
import { controlRoomLocations } from '../data/controlRoomLocations';
import { getHazardDemoData } from '../data/hazardDemo';
import { audienceOptions, getCommunicationLog, PUBLIC_AUDIENCES, sendCommunication } from '../data/communications';
import { getAssignments, FIELD_OFFICERS_DEPLOYED } from '../data/officerAssignments';
import { responseTeams } from '../data/unsafeRouteGroups';

const DELIVERY_OPTIONS = ['SMS', 'Emergency Alert', 'Public Platform Notification'];

export default function Communication() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [hazardId, setHazardId] = useState(controlRoomLocations[0]?.hazardId ?? '');
  const [audience, setAudience] = useState(audienceOptions[0]);
  const [zoneId, setZoneId] = useState('');
  const [centreId, setCentreId] = useState('');
  const [message, setMessage] = useState('');
  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS);
  const [confirmPending, setConfirmPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [selectedLogId, setSelectedLogId] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('safesetu-gov-auth') !== 'true') {
      navigate('/government/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleStateUpdate = () => setRefreshKey((value) => value + 1);
    window.addEventListener('safesetu-communications-updated', handleStateUpdate);
    window.addEventListener('storage', handleStateUpdate);
    return () => {
      window.removeEventListener('safesetu-communications-updated', handleStateUpdate);
      window.removeEventListener('storage', handleStateUpdate);
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const location = controlRoomLocations.find((item) => item.hazardId === hazardId) ?? null;
  const zones = useMemo(() => getAssignments(hazardId), [hazardId]);
  const hazard = useMemo(() => getHazardDemoData().hazards.find((item) => item.id === hazardId) ?? null, [hazardId]);
  const centres = hazard?.relocationAreas.filter((area) => area.approvalStatus === 'APPROVED' && area.operationalStatus === 'ACTIVE') ?? [];

  const needsLocation = audience !== 'FIELD OFFICERS' && audience !== 'EMERGENCY RESPONSE TEAMS';

  const { recipients, audienceLabel } = useMemo(() => {
    if (audience === 'FIELD OFFICERS') {
      return { recipients: FIELD_OFFICERS_DEPLOYED, audienceLabel: 'Field Officers' };
    }
    if (audience === 'EMERGENCY RESPONSE TEAMS') {
      return { recipients: responseTeams.length, audienceLabel: 'Emergency Response Teams' };
    }
    if (!location) {
      return { recipients: 0, audienceLabel: '' };
    }
    if (audience === 'ALL AFFECTED PEOPLE' || audience === 'SPECIFIC DISASTER LOCATION') {
      return { recipients: location.peopleAtRisk, audienceLabel: `All ${location.location} affected areas` };
    }
    if (audience === 'SPECIFIC ZONE') {
      const zone = zones.find((item) => item.zoneId === zoneId) ?? zones[0];
      const perZone = zones.length > 0 ? Math.round(location.peopleAtRisk / zones.length) : 0;
      return { recipients: perZone, audienceLabel: zone?.zoneLabel ?? location.location };
    }
    if (audience === 'RELOCATION CENTRE OCCUPANTS') {
      const centre = centres.find((item) => item.id === centreId) ?? centres[0];
      return { recipients: centre?.peoplePresent ?? 0, audienceLabel: centre?.name ?? 'Relocation centre' };
    }
    return { recipients: 0, audienceLabel: '' };
  }, [audience, location, zones, zoneId, centres, centreId]);

  const isPublicAudience = PUBLIC_AUDIENCES.includes(audience);

  function toggleDelivery(option) {
    setDelivery((current) => (current.includes(option) ? current.filter((item) => item !== option) : [...current, option]));
  }

  function handleComposerSubmit(event) {
    event.preventDefault();
    if (!message.trim()) {
      setNotice('Enter a message before sending.');
      return;
    }

    if (isPublicAudience && !confirmPending) {
      setConfirmPending(true);
      return;
    }

    sendCommunication({ audienceLabel, recipients, message: message.trim(), delivery });
    setNotice('Message sent successfully.');
    setMessage('');
    setConfirmPending(false);
    setRefreshKey((value) => value + 1);
  }

  const log = getCommunicationLog();
  const selectedLog = log.find((item) => item.id === selectedLogId) ?? null;

  return (
    <div className="crs-layout">
      <ControlRoomSidebar active="comms" />

      <main className="crs-main">
        <header className="crs-main__header">
          <div>
            <p className="lcc-eyebrow">SAFESETU · CONTROL ROOM</p>
            <h1>EMERGENCY COMMUNICATION</h1>
          </div>
        </header>

        <section className="lcc-panel comm-composer">
          <div className="lcc-panel__heading">
            <p>SEND EMERGENCY MESSAGE</p>
            <h3><MessagesSquare size={16} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />Official communication only — authorised Control Room / field officers</h3>
          </div>

          <form className="uwr-form-grid" onSubmit={handleComposerSubmit}>
            <label className="uwr-field">
              <span>Audience</span>
              <select
                onChange={(event) => {
                  setAudience(event.target.value);
                  setConfirmPending(false);
                }}
                value={audience}
              >
                {audienceOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            {needsLocation && (
              <label className="uwr-field">
                <span>Disaster Location</span>
                <select onChange={(event) => { setHazardId(event.target.value); setConfirmPending(false); }} value={hazardId}>
                  {controlRoomLocations.map((item) => (
                    <option key={item.hazardId} value={item.hazardId}>{item.location}</option>
                  ))}
                </select>
              </label>
            )}

            {audience === 'SPECIFIC ZONE' && (
              <label className="uwr-field">
                <span>Zone</span>
                <select onChange={(event) => { setZoneId(event.target.value); setConfirmPending(false); }} value={zoneId || zones[0]?.zoneId || ''}>
                  {zones.map((zone) => (
                    <option key={zone.zoneId} value={zone.zoneId}>{zone.zoneLabel}</option>
                  ))}
                </select>
              </label>
            )}

            {audience === 'RELOCATION CENTRE OCCUPANTS' && (
              <label className="uwr-field">
                <span>Relocation Centre</span>
                <select onChange={(event) => { setCentreId(event.target.value); setConfirmPending(false); }} value={centreId || centres[0]?.id || ''}>
                  {centres.length === 0 ? (
                    <option value="">No active centres</option>
                  ) : (
                    centres.map((centre) => (
                      <option key={centre.id} value={centre.id}>{centre.name}</option>
                    ))
                  )}
                </select>
              </label>
            )}

            <label className="uwr-field comm-composer__message">
              <span>Message</span>
              <textarea
                onChange={(event) => { setMessage(event.target.value); setConfirmPending(false); }}
                placeholder="e.g. Cyclone evacuation has been ordered. Proceed to Bhubaneswar Emergency Shelter."
                rows={3}
                value={message}
              />
            </label>

            <div className="uwr-field comm-composer__delivery">
              <span>Delivery</span>
              <div className="comm-delivery-options">
                {DELIVERY_OPTIONS.map((option) => (
                  <label className="uwr-checkbox" key={option}>
                    <input checked={delivery.includes(option)} onChange={() => toggleDelivery(option)} type="checkbox" />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="comm-composer__recipients">
              <span>Recipients</span>
              <strong>{recipients.toLocaleString('en-IN')} {audience === 'FIELD OFFICERS' ? 'officers' : audience === 'EMERGENCY RESPONSE TEAMS' ? 'teams' : 'people'}</strong>
            </div>

            {confirmPending && isPublicAudience && (
              <div className="comm-confirm">
                <div>
                  <span>RECIPIENTS</span>
                  <strong>{recipients.toLocaleString('en-IN')} PEOPLE</strong>
                </div>
                <div>
                  <span>AUDIENCE</span>
                  <strong>{audienceLabel.toUpperCase()}</strong>
                </div>
                <p>This message will be delivered to the public. Review carefully before confirming.</p>
              </div>
            )}

            <div className="comm-composer__submit">
              <button className="review-decision__approve" type="submit">
                <Send size={15} /> {confirmPending && isPublicAudience ? 'CONFIRM & SEND' : 'SEND MESSAGE'}
              </button>
            </div>
          </form>
        </section>

        <section className="lcc-panel">
          <div className="lcc-panel__heading">
            <p>RECENT COMMUNICATIONS</p>
            <h3>Communication history</h3>
          </div>
          <div className="comm-history">
            {log.map((entry) => (
              <button className="comm-history__item" key={entry.id} onClick={() => setSelectedLogId(entry.id)} type="button">
                <span className="comm-history__time">{entry.time}</span>
                <span className="comm-history__audience">{entry.audienceLabel}</span>
                <span className="comm-history__recipients">{entry.recipients.toLocaleString('en-IN')} recipients</span>
                <span className="comm-history__message">{entry.message}</span>
                <span className="comm-history__delivery">{entry.delivery.join(' + ')}</span>
                <span className="uwr-status uwr-status--assigned">🟢 {entry.status}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {selectedLog && (
        <div className="review-modal-backdrop" aria-modal="true" role="dialog" onClick={() => setSelectedLogId(null)}>
          <div className="review-modal" onClick={(event) => event.stopPropagation()}>
            <button className="review-modal__close" onClick={() => setSelectedLogId(null)} type="button" aria-label="Close message details">
              <X size={16} />
            </button>
            <div className="review-modal__header">
              <p>MESSAGE DETAILS</p>
              <button className="review-modal__dismiss" onClick={() => setSelectedLogId(null)} type="button">Close popup</button>
            </div>
            <h2>{selectedLog.audienceLabel}</h2>
            <div className="review-grid review-grid--two">
              <div><span>Sent</span><strong>{selectedLog.time}</strong></div>
              <div><span>Recipients</span><strong>{selectedLog.recipients.toLocaleString('en-IN')}</strong></div>
              <div><span>Delivery</span><strong>{selectedLog.delivery.join(', ')}</strong></div>
              <div><span>Status</span><strong>🟢 {selectedLog.status}</strong></div>
            </div>
            <div className="review-details-block">
              <h3>Message</h3>
              <p>{selectedLog.message}</p>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="control-room-toast">
          <button className="control-room-toast__close" onClick={() => setNotice('')} type="button" aria-label="Close notification">
            <X size={14} />
          </button>
          {notice}
        </div>
      )}
    </div>
  );
}

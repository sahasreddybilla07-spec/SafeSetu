import {
  AlertTriangle,
  Boxes,
  Globe,
  History,
  LogOut,
  MapPinned,
  MessagesSquare,
  ShieldAlert,
  TentTree,
  UserCog,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: ShieldAlert, path: '/government/control-room' },
  { key: 'hazards', label: 'Active Hazards', icon: AlertTriangle, path: '/government/control-room' },
  { key: 'field-ops', label: 'Field Operations', icon: MapPinned, path: '/field-officer' },
  { key: 'officers', label: 'Officer Assignment', icon: UserCog, path: '/government/control-room/officers' },
  { key: 'centres', label: 'Relocation Centres', icon: TentTree, path: '/government/control-room' },
  { key: 'unsafe', label: 'People Without Safe Routes', icon: Users, path: '/government/control-room' },
  { key: 'comms', label: 'Communication', icon: MessagesSquare, path: '/government/control-room/communication' },
  { key: 'resources', label: 'Resources', icon: Boxes, path: '/government/control-room' },
  { key: 'map', label: 'Map', icon: MapPinned, path: '/government/control-room' },
  { key: 'history', label: 'Incident History', icon: History, path: '/government/control-room' },
];

export default function ControlRoomSidebar({ active }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('safesetu-gov-auth');
    localStorage.removeItem('safesetu-gov-official');
    navigate('/government/login', { replace: true });
  }

  return (
    <aside className="crs-sidebar" aria-label="Control Room navigation">
      <div className="crs-sidebar__brand">
        <img alt="" aria-hidden="true" className="crs-sidebar__mark" src="/safesetu-crest.png" />
        <div>
          <strong>SAFESETU</strong>
          <span>CONTROL ROOM</span>
        </div>
      </div>

      <nav className="crs-sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`crs-sidebar__item${active === item.key ? ' is-active' : ''}`}
              key={item.key}
              onClick={() => navigate(item.path)}
              type="button"
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="crs-sidebar__footer">
        <button className="crs-sidebar__footer-item" onClick={() => navigate('/')} type="button">
          <Globe size={14} />
          Public Platform
        </button>
        <button className="crs-sidebar__footer-item crs-sidebar__footer-item--logout" onClick={handleLogout} type="button">
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}

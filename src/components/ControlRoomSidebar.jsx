import {
  Boxes,
  Home,
  History,
  LogOut,
  MessagesSquare,
  ShieldAlert,
  TentTree,
  UserCog,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { clearGovernmentSession, getCurrentGovernmentRole, getRoleConfig } from '../utils/rbac';

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: ShieldAlert, path: '/government/control-room' },
  { key: 'officers', label: 'Officer Assignment', icon: UserCog, path: '/government/control-room/officers' },
  { key: 'centres', label: 'Relocation Centres', icon: TentTree, path: '/government/control-room/relocation-centres' },
  { key: 'unsafe', label: 'People Without Safe Routes', icon: Users, path: '/government/control-room/unsafe-routes' },
  { key: 'comms', label: 'Communication', icon: MessagesSquare, path: '/government/control-room/communication' },
  { key: 'resources', label: 'Resources', icon: Boxes, path: '/government/control-room/resources' },
  { key: 'history', label: 'Incident History', icon: History, path: '/government/control-room/incident-history' },
];

export default function ControlRoomSidebar({ active, role: roleProp }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const role = roleProp ?? getCurrentGovernmentRole();
  const roleConfig = getRoleConfig(role);

  function handleLogout() {
    clearGovernmentSession();
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
        {NAV_ITEMS.filter((item) => !roleConfig || roleConfig.allowedNav.includes(item.key)).map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`crs-sidebar__item${active === item.key ? ' is-active' : ''}`}
              key={item.key}
              onClick={() => navigate(item.path)}
              type="button"
            >
              <Icon size={15} />
              <span>{t(item.label)}</span>
            </button>
          );
        })}
      </nav>

      <div className="crs-sidebar__footer">
        <button className="crs-sidebar__footer-item" onClick={() => navigate('/')} type="button">
          <Home size={14} />
          Home
        </button>
        <button className="crs-sidebar__footer-item crs-sidebar__footer-item--logout" onClick={handleLogout} type="button">
          <LogOut size={14} />
          {t('Logout')}
        </button>
      </div>
    </aside>
  );
}

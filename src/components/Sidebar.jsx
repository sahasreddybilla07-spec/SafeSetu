import { NavLink } from 'react-router-dom';

const navigationItems = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Hazard map', to: '/admin/map' },
  { label: 'Control room', to: '/admin/control-room' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Admin navigation">
      <nav className="sidebar__nav">
        {navigationItems.map(({ label, to, end }) => (
          <NavLink
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
            end={end}
            key={to}
            to={to}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

import { Bell, ShieldCheck } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname, hash } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    const adminLinks = [
      { label: 'Dashboard', to: '/admin', end: true },
      { label: 'Hazard Map', to: '/admin/map' },
      { label: 'Control Room', to: '/admin/control-room' },
    ];

    return (
      <header className="navbar admin-navbar">
        <Link className="navbar__brand" to="/">
          <span className="navbar__mark" aria-hidden="true">S</span>
          <span>SAFESETU</span>
        </Link>
        <nav aria-label="Admin navigation" className="admin-navbar__links">
          {adminLinks.map(({ label, to, end }) => (
            <NavLink
              className={({ isActive }) => `admin-navbar__link${isActive ? ' admin-navbar__link--active' : ''}`}
              end={end}
              key={to}
              to={to}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-navbar__right">
          <span className="admin-navbar__status"><ShieldCheck size={14} /> SYSTEM OPERATIONAL</span>
          <span className="admin-navbar__official"><Bell size={15} /><span><strong>R. Sharma</strong><small>District Collector</small></span></span>
        </div>
      </header>
    );
  }

  const publicLinks = [
    { label: 'Hazard Map', to: '/#hazard-map', match: ['', '#hazard-map'] },
    { label: 'Alerts', to: '/#alerts', match: ['#alerts'] },
    { label: 'Safe Areas', to: '/#safe-areas', match: ['#safe-areas'] },
  ];
  const activeHash = pathname === '/' ? hash : '__none__';

  return (
    <header className="navbar public-navbar">
      <Link className="navbar__brand" to="/">
        <span className="navbar__mark" aria-hidden="true">S</span>
        <span>SAFESETU</span>
      </Link>
      <nav aria-label="Primary navigation" className="navbar__links">
        {publicLinks.map((link) => (
          <Link
            className={`navbar__link${link.match.includes(activeHash) ? ' navbar__link--active' : ''}`}
            key={link.label}
            to={link.to}
          >
            {link.label}
          </Link>
        ))}
        <Link className="navbar__login" to="/login">Login</Link>
      </nav>
    </header>
  );
}

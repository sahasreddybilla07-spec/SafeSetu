import { Bell, Info, PhoneCall, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function Navbar() {
  const { pathname, hash } = useLocation();
  const { t } = useLanguage();
  const [publicDialog, setPublicDialog] = useState(null);
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    const adminLinks = [
      { label: t('Dashboard'), to: '/admin', end: true },
      { label: t('Hazard Map'), to: '/admin/map' },
      { label: t('Control Room'), to: '/admin/control-room' },
    ];

    return (
      <header className="navbar admin-navbar">
        <Link className="navbar__brand" to="/">
          <img alt="" aria-hidden="true" className="navbar__mark" src="/safesetu-crest.png" />
          <span>SAHAS</span>
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
          <span className="admin-navbar__status"><ShieldCheck size={14} /> {t('SYSTEM OPERATIONAL')}</span>
          <span className="admin-navbar__official"><Bell size={15} /><span><strong>R. Sharma</strong><small>District Collector</small></span></span>
        </div>
      </header>
    );
  }

  const publicLinks = [
    { label: 'Alerts', to: '/#alerts', match: ['#alerts'] },
  ];
  const activeHash = pathname === '/' ? hash : '__none__';

  return (
    <header className="navbar public-navbar">
      <Link className="navbar__brand" to="/">
        <img alt="" aria-hidden="true" className="navbar__mark" src="/safesetu-crest.png" />
        <span>SAHAS</span>
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
        <button className="navbar__utility" onClick={() => setPublicDialog('about')} type="button">
          <Info size={16} aria-hidden="true" /> {t('About Us')}
        </button>
        <button className="navbar__utility navbar__utility--contact" onClick={() => setPublicDialog('contact')} type="button">
          <PhoneCall size={16} aria-hidden="true" /> {t('Contact Us')}
        </button>
        <Link className="navbar__login" to="/login">{t('Login')}</Link>
      </nav>
      {publicDialog && (
        <div className="public-info-backdrop" onClick={() => setPublicDialog(null)} role="presentation">
          <section aria-labelledby="public-info-title" className="public-info-dialog" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button aria-label="Close information panel" className="public-info-dialog__close" onClick={() => setPublicDialog(null)} type="button"><X size={18} /></button>
            {publicDialog === 'about' ? <><p>About SAHAS</p><h2 id="public-info-title">Safety intelligence for stronger communities</h2><span>SAHAS brings illustrative hazard awareness, preparedness information and approved safe-area guidance into one easy-to-use public platform.</span></> : <><p>Contact SAHAS</p><h2 id="public-info-title">Need support or more information?</h2><span>For emergencies, call <strong>112</strong>. For this illustrative platform, contact your local disaster-management authority or district control room.</span></>}
          </section>
        </div>
      )}
    </header>
  );
}

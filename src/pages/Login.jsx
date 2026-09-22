import { useEffect, useState } from 'react';
import { ArrowRight, Building2, Globe2, LockKeyhole, MapPinned, ShieldCheck, UserRoundCog } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { ROLE_CONFIG, clearGovernmentSession } from '../utils/rbac';

const DEMO_ACCOUNTS = {
  national: { ...ROLE_CONFIG.national, icon: <Globe2 size={20} /> },
  state: { ...ROLE_CONFIG.state, icon: <Building2 size={20} /> },
  district: { ...ROLE_CONFIG.district, icon: <MapPinned size={20} /> },
  fieldOfficer: {
    label: 'Field Officer',
    route: '/field-officer',
    officialId: 'field-officer',
    password: 'fieldofficer123',
    description: 'On-site shelter occupancy updates',
    icon: <UserRoundCog size={20} />,
  },
};

function matchesDemoLogin(role, officialId, password) {
  const cleanOfficialId = String(officialId ?? '').trim().toLowerCase();
  const cleanPassword = String(password ?? '').trim();
  const account = DEMO_ACCOUNTS[role];

  if (!account) {
    return false;
  }

  return cleanOfficialId === account.officialId && cleanPassword === account.password;
}

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedScope, setSelectedScope] = useState(null);
  const [officialId, setOfficialId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedRole = localStorage.getItem('safesetu-gov-role');
    if (localStorage.getItem('safesetu-gov-auth') === 'true' && DEMO_ACCOUNTS[savedRole]) {
      navigate(DEMO_ACCOUNTS[savedRole].dashboardPath, { replace: true });
      return;
    }

    if (localStorage.getItem('safesetu-field-officer-auth') === 'true') {
      navigate('/field-officer', { replace: true });
    }
  }, [navigate]);

  function handleSubmit(event) {
    event.preventDefault();
    const loginRole = selectedRole === 'monitoringOfficer' ? selectedScope : selectedRole;

    if (!loginRole) {
      setError('Please choose the login type first.');
      return;
    }

    if (!officialId || !password) {
      setError('Please enter both your official ID and password.');
      return;
    }

    if (!matchesDemoLogin(loginRole, officialId, password)) {
      const account = DEMO_ACCOUNTS[loginRole];
      setError(`Demo sign-in failed. Use ${account.officialId} / ${account.password}.`);
      return;
    }

    if (loginRole !== 'fieldOfficer') {
      localStorage.removeItem('safesetu-field-officer-auth');
      localStorage.removeItem('safesetu-field-officer-name');
      localStorage.setItem('safesetu-gov-auth', 'true');
      localStorage.setItem('safesetu-gov-role', loginRole);
      localStorage.setItem('safesetu-gov-official', DEMO_ACCOUNTS[loginRole].label);
      navigate(DEMO_ACCOUNTS[loginRole].dashboardPath, { replace: true });
      return;
    }

  clearGovernmentSession();
    localStorage.setItem('safesetu-field-officer-auth', 'true');
    localStorage.setItem('safesetu-field-officer-name', 'Field Officer');
    navigate('/field-officer', { replace: true });
  }

  return (
    <main className="login-page">
      <section className="login-page__branding" aria-label="SAFESETU platform identity">
        <Link className="login-brand" to="/" aria-label="Return to SAFESETU public map">
          <img alt="SAFESETU logo" className="login-brand__mark" src="/safesetu-crest.png" />
          <span>SAFESETU</span>
        </Link>
        <div className="login-page__identity">
          <p>{t('National Disaster Management')}</p>
          <h1>{t('Secure Access Portal')}</h1>
          <span>{t('Choose your role to continue to the relevant dashboard')}</span>
        </div>
        <div className="login-page__notice">
          <ShieldCheck size={20} />
          <p>{t('Secure operational access for authorised disaster-management personnel.')}</p>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-form__heading">
            <span className="login-form__icon"><LockKeyhole size={20} /></span>
            <div>
              <p>{t('Restricted access')}</p>
              <h2 id="login-title">{selectedRole === 'monitoringOfficer' && !selectedScope ? 'Select Monitoring Level' : selectedRole ? `${t(DEMO_ACCOUNTS[selectedRole === 'monitoringOfficer' ? selectedScope : selectedRole].label)} ${t('Login')}` : t('Select Login Type')}</h2>
            </div>
          </div>

          {!selectedRole && (
            <div className="login-role-grid" aria-label="Choose a login role">
              {[
                ['monitoringOfficer', { label: 'Monitoring Officer', description: 'Choose Central, State, or District access level', icon: <Globe2 size={20} /> }],
                ['fieldOfficer', DEMO_ACCOUNTS.fieldOfficer],
              ].map(([role, details]) => (
                <button
                  className="login-role-card"
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setSelectedScope(null);
                    setError('');
                  }}
                  type="button"
                >
                  <span className="login-role-card__icon">{details.icon}</span>
                  <strong>{t(details.label)}</strong>
                  <small>{t(details.description)}</small>
                </button>
              ))}
            </div>
          )}

          {selectedRole === 'monitoringOfficer' && !selectedScope && (
            <div className="login-scope-grid" aria-label="Choose monitoring level">
              {['national', 'state', 'district'].map((scope) => {
                const details = DEMO_ACCOUNTS[scope];
                return (
                  <button className="login-role-card" key={scope} onClick={() => { setSelectedScope(scope); setError(''); }} type="button">
                    <strong>{scope === 'national' ? 'Central / India-wide' : `${scope[0].toUpperCase()}${scope.slice(1)} level`}</strong>
                    <small>{details.description}</small>
                  </button>
                );
              })}
            </div>
          )}

          {selectedRole && (selectedRole !== 'monitoringOfficer' || selectedScope) && (
            <>
              <label htmlFor="officialId">{t('Official ID')}</label>
              <input
                id="officialId"
                value={officialId}
                onChange={(event) => setOfficialId(event.target.value)}
                placeholder={t('Enter official ID')}
              />

              <label htmlFor="password">{t('Password')}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('Enter your password')}
              />

              {error && <p className="login-form__error" role="alert">{error}</p>}

              <div className="login-demo-credentials">
                <span>{t('Demo credentials')}</span>
                <strong>{DEMO_ACCOUNTS[selectedRole === 'monitoringOfficer' ? selectedScope : selectedRole].officialId} / {DEMO_ACCOUNTS[selectedRole === 'monitoringOfficer' ? selectedScope : selectedRole].password}</strong>
              </div>

              <button className="login-form__submit" type="submit">
                <span>{t('SIGN IN')}</span><ArrowRight size={18} />
              </button>

              <button className="login-form__back" onClick={() => selectedRole === 'monitoringOfficer' && selectedScope ? setSelectedScope(null) : setSelectedRole(null)} type="button">
                {selectedRole === 'monitoringOfficer' && selectedScope ? 'Choose another monitoring level' : t('Choose another role')}
              </button>
            </>
          )}

          {selectedRole && (selectedRole !== 'monitoringOfficer' || selectedScope) && <p className="login-form__authorised"><Building2 size={15} /> {t('Authorised')} {t(DEMO_ACCOUNTS[selectedRole === 'monitoringOfficer' ? selectedScope : selectedRole].label)} {t('Access')}</p>}
        </form>
      </section>
    </main>
  );
}

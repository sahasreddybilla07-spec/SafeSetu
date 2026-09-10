import { useEffect, useState } from 'react';
import { ArrowRight, Building2, LockKeyhole, ShieldCheck, UserRoundCog } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DEMO_ACCOUNTS = {
  government: {
    label: 'Government Official',
    route: '/government/control-room',
    officialId: 'control-room-admin',
    password: 'safesetu123',
    description: 'Control Room Administrator access',
    icon: <Building2 size={20} />,
  },
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
  const [selectedRole, setSelectedRole] = useState(null);
  const [officialId, setOfficialId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('safesetu-gov-auth') === 'true') {
      navigate('/government/control-room', { replace: true });
      return;
    }

    if (localStorage.getItem('safesetu-field-officer-auth') === 'true') {
      navigate('/field-officer', { replace: true });
    }
  }, [navigate]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!selectedRole) {
      setError('Please choose the login type first.');
      return;
    }

    if (!officialId || !password) {
      setError('Please enter both your official ID and password.');
      return;
    }

    if (!matchesDemoLogin(selectedRole, officialId, password)) {
      const account = DEMO_ACCOUNTS[selectedRole];
      setError(`Demo sign-in failed. Use ${account.officialId} / ${account.password}.`);
      return;
    }

    if (selectedRole === 'government') {
      localStorage.setItem('safesetu-gov-auth', 'true');
      localStorage.setItem('safesetu-gov-official', 'Control Room Administrator');
      navigate('/government/control-room', { replace: true });
      return;
    }

    localStorage.setItem('safesetu-field-officer-auth', 'true');
    localStorage.setItem('safesetu-field-officer-name', 'Field Officer');
    navigate('/field-officer', { replace: true });
  }

  return (
    <main className="login-page">
      <section className="login-page__branding" aria-label="SAFESETU platform identity">
        <Link className="login-brand" to="/" aria-label="Return to SAFESETU public map">
          <span className="login-brand__mark"><ShieldCheck size={26} strokeWidth={1.8} /></span>
          <span>SAFESETU</span>
        </Link>
        <div className="login-page__identity">
          <p>National Disaster Management</p>
          <h1>Secure Access Portal</h1>
          <span>Choose your role to continue to the relevant dashboard</span>
        </div>
        <div className="login-page__notice">
          <ShieldCheck size={20} />
          <p>Secure operational access for authorised disaster-management personnel.</p>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-form__heading">
            <span className="login-form__icon"><LockKeyhole size={20} /></span>
            <div>
              <p>Restricted access</p>
              <h2 id="login-title">{selectedRole ? `${DEMO_ACCOUNTS[selectedRole].label} Login` : 'Select Login Type'}</h2>
            </div>
          </div>

          {!selectedRole && (
            <div className="login-role-grid" aria-label="Choose a login role">
              {Object.entries(DEMO_ACCOUNTS).map(([role, details]) => (
                <button
                  className="login-role-card"
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setError('');
                  }}
                  type="button"
                >
                  <span className="login-role-card__icon">{details.icon}</span>
                  <strong>{details.label}</strong>
                  <small>{details.description}</small>
                </button>
              ))}
            </div>
          )}

          {selectedRole && (
            <>
              <label htmlFor="officialId">Official ID</label>
              <input
                id="officialId"
                value={officialId}
                onChange={(event) => setOfficialId(event.target.value)}
                placeholder="Enter official ID"
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />

              {error && <p className="login-form__error" role="alert">{error}</p>}

              <div className="login-demo-credentials">
                <span>Demo credentials</span>
                <strong>{DEMO_ACCOUNTS[selectedRole].officialId} / {DEMO_ACCOUNTS[selectedRole].password}</strong>
              </div>

              <button className="login-form__submit" type="submit">
                <span>SIGN IN</span><ArrowRight size={18} />
              </button>

              <button className="login-form__back" onClick={() => setSelectedRole(null)} type="button">
                Choose another role
              </button>
            </>
          )}

          {selectedRole && <p className="login-form__authorised"><Building2 size={15} /> Authorised {DEMO_ACCOUNTS[selectedRole].label} Access</p>}
        </form>
      </section>
    </main>
  );
}

import { useState } from 'react';
import { ArrowRight, Building2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!role || !district || !password) {
      setError('Please select your role and district, then enter a password.');
      return;
    }

    localStorage.setItem('safesetuRole', role);
    localStorage.setItem('safesetuDistrict', district);
    navigate('/admin');
  }

  return (
    <main className="login-page">
      <section className="login-page__branding" aria-label="SAFESETU platform identity">
        <Link className="login-brand" to="/" aria-label="Return to SAFESETU public map">
          <span className="login-brand__mark"><ShieldCheck size={26} strokeWidth={1.8} /></span>
          <span>SAFESETU</span>
        </Link>
        <div className="login-page__identity">
          <p>Disaster Management</p>
          <h1>Decision Support System</h1>
          <span>Government of India · Public Safety Platform</span>
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
              <h2 id="login-title">Government Official Login</h2>
            </div>
          </div>

          <label htmlFor="role">Role</label>
          <select id="role" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="">Select your role</option>
            <option>District Collector</option>
            <option>SDMA Control Room Officer</option>
            <option>NDMA State Nodal Officer</option>
          </select>

          <label htmlFor="district">District</label>
          <select id="district" value={district} onChange={(event) => setDistrict(event.target.value)}>
            <option value="">Select your district</option>
            <option>Rampur District</option>
            <option>Kotwa District</option>
          </select>

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />

          {error && <p className="login-form__error" role="alert">{error}</p>}

          <button className="login-form__submit" type="submit">
            <span>LOGIN</span><ArrowRight size={18} />
          </button>
          <p className="login-form__authorised"><Building2 size={15} /> Authorised Government Personnel Only</p>
        </form>
      </section>
    </main>
  );
}

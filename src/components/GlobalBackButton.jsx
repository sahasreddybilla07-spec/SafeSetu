import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const PAGES_WITH_LOCAL_BACK = [
  '/hazard-demo',
  '/hazard-demo/report',
  '/field-officer',
  '/government/control-room/hazard/',
  '/government/control-room/map/',
  '/emergency',
  '/admin',
];

function hasLocalBack(pathname) {
  return PAGES_WITH_LOCAL_BACK.some((path) => path.endsWith('/') ? pathname.startsWith(path) : pathname === path);
}

export default function GlobalBackButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname === '/' || pathname.startsWith('/government/') || hasLocalBack(pathname)) return null;

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  }

  return (
    <button aria-label="Go back" className="global-back-button" onClick={handleBack} title="Go back" type="button">
      <ArrowLeft aria-hidden="true" size={16} />
      <span>Back</span>
    </button>
  );
}

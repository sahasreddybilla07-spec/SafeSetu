import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ControlRoom from './pages/ControlRoom';
import Dashboard from './pages/Dashboard';
import HazardMap from './pages/HazardMap';
import Login from './pages/Login';
import PublicEmergency from './pages/PublicEmergency';
import PublicMap from './pages/PublicMap';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-layout__body">
        <Sidebar />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicMap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/emergency" element={<PublicEmergency />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<HazardMap />} />
          <Route path="control-room" element={<ControlRoom />} />
          <Route path="roadmap" element={<Navigate to="/admin" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

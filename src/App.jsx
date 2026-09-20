import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ControlRoom from './pages/ControlRoom';
import ControlRoomLocationMap from './pages/ControlRoomLocationMap';
import Dashboard from './pages/Dashboard';
import FieldOfficerDashboard from './pages/FieldOfficerDashboard';
import HazardDemo from './pages/HazardDemo';
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

function GovernmentRouteGuard() {
  return localStorage.getItem('safesetu-gov-auth') === 'true' ? <ControlRoom /> : <Navigate to="/government/login" replace />;
}

function FieldOfficerRouteGuard() {
  return localStorage.getItem('safesetu-field-officer-auth') === 'true' ? <FieldOfficerDashboard /> : <Navigate to="/government/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicMap />} />
        <Route path="/hazard-demo" element={<HazardDemo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/government" element={<Navigate to="/government/login" replace />} />
        <Route path="/government/login" element={<Login />} />
        <Route path="/government/control-room" element={<ControlRoom />} />
        <Route path="/government/control-room/map/:locationId" element={<ControlRoomLocationMap />} />
        <Route path="/government/field-officer" element={<FieldOfficerDashboard />} />
        <Route path="/field-officer" element={<FieldOfficerDashboard />} />
        <Route path="/emergency" element={<PublicEmergency />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<HazardMap />} />
          <Route path="control-room" element={<ControlRoom />} />
          <Route path="field-officer" element={<FieldOfficerDashboard />} />
          <Route path="roadmap" element={<Navigate to="/admin" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

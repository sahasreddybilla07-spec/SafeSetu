import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import LanguageSelector from './components/LanguageSelector';
import GlobalBackButton from './components/GlobalBackButton';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { LanguageProvider } from './i18n/LanguageContext';
import ControlRoom from './pages/ControlRoom';
import ControlRoomLocationMap from './pages/ControlRoomLocationMap';
import ControlRoomOverview from './pages/ControlRoomOverview';
import LocationCommandCentre from './pages/LocationCommandCentre';
import OfficerAssignment from './pages/OfficerAssignment';
import Communication from './pages/Communication';
import ControlRoomIncidentHistory from './pages/ControlRoomIncidentHistory';
import ControlRoomRelocationCentres from './pages/ControlRoomRelocationCentres';
import ControlRoomResources from './pages/ControlRoomResources';
import ControlRoomUnsafeRoutes from './pages/ControlRoomUnsafeRoutes';
import Dashboard from './pages/Dashboard';
import FieldOfficerDashboard from './pages/FieldOfficerDashboard';
import HazardDemo from './pages/HazardDemo';
import HazardMap from './pages/HazardMap';
import Login from './pages/Login';
import PublicEmergency from './pages/PublicEmergency';
import PublicMap from './pages/PublicMap';
import SituationReport from './pages/SituationReport';
import RoleDashboard from './pages/RoleDashboard';
import { hasPermission, isGovernmentAuthenticated } from './utils/rbac';

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

function GovernmentPermissionRoute({ permission, children }) {
  return isGovernmentAuthenticated() && hasPermission(permission) ? children : <Navigate to="/government/login" replace />;
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <LanguageSelector />
        <GlobalBackButton />
        <Routes>
        <Route path="/" element={<PublicMap />} />
        <Route path="/hazard-demo" element={<HazardDemo />} />
        <Route path="/hazard-demo/report" element={<SituationReport />} />
        <Route path="/login" element={<Login />} />
        <Route path="/government" element={<Navigate to="/government/login" replace />} />
        <Route path="/government/login" element={<Login />} />
        <Route path="/government/control-room" element={<RoleDashboard />} />
        <Route path="/government/national-dashboard" element={<RoleDashboard routeRole="national" />} />
        <Route path="/government/state-dashboard" element={<RoleDashboard routeRole="state" />} />
        <Route path="/government/district-dashboard" element={<RoleDashboard routeRole="district" />} />
        <Route path="/government/control-room/relocation-centres" element={<GovernmentPermissionRoute permission="review-centres"><ControlRoomRelocationCentres /></GovernmentPermissionRoute>} />
        <Route path="/government/control-room/unsafe-routes" element={<GovernmentPermissionRoute permission="manage-routes"><ControlRoomUnsafeRoutes /></GovernmentPermissionRoute>} />
        <Route path="/government/control-room/resources" element={<GovernmentPermissionRoute permission="view-resources"><ControlRoomResources /></GovernmentPermissionRoute>} />
        <Route path="/government/control-room/incident-history" element={<GovernmentPermissionRoute permission="view-history"><ControlRoomIncidentHistory /></GovernmentPermissionRoute>} />
        <Route path="/government/control-room/hazard/:hazardId" element={<GovernmentPermissionRoute permission="review-centres"><LocationCommandCentre /></GovernmentPermissionRoute>} />
        <Route path="/government/control-room/map/:locationId" element={<ControlRoomLocationMap />} />
        <Route path="/government/control-room/officers" element={<GovernmentPermissionRoute permission="assign-officers"><OfficerAssignment /></GovernmentPermissionRoute>} />
        <Route path="/government/control-room/communication" element={<GovernmentPermissionRoute permission="send-alerts"><Communication /></GovernmentPermissionRoute>} />
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
    </LanguageProvider>
  );
}

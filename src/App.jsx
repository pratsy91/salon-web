import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Clients from './pages/Clients';
import Subscription from './pages/Subscription';
import Plans from './pages/Plans';
import Salons from './pages/Salons';
import SubscriptionHistory from './pages/SubscriptionHistory';

const SALON_USERS = ['SALON_OWNER', 'RECEPTIONIST'];
const SUPER_ADMIN = ['SUPER_ADMIN'];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProtectedRoute allow={SALON_USERS}><Dashboard /></ProtectedRoute>} />
        <Route path="appointments" element={<ProtectedRoute allow={SALON_USERS}><Appointments /></ProtectedRoute>} />
        <Route path="clients" element={<ProtectedRoute allow={SALON_USERS}><Clients /></ProtectedRoute>} />
        <Route path="subscription" element={<ProtectedRoute allow={['SALON_OWNER']}><Subscription /></ProtectedRoute>} />
        <Route path="plans" element={<ProtectedRoute allow={SUPER_ADMIN}><Plans /></ProtectedRoute>} />
        <Route path="salons" element={<ProtectedRoute allow={SUPER_ADMIN}><Salons /></ProtectedRoute>} />
        <Route path="subscription-history" element={<ProtectedRoute allow={SUPER_ADMIN}><SubscriptionHistory /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

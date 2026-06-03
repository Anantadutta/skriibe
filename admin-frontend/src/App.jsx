import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import VerificationQueue from './pages/VerificationQueue';
import ApproveCreator from './pages/ApproveCreator';
import RejectCreator from './pages/RejectCreator';
import DisputeScreen from './pages/DisputeScreen';
import RefundDispute from './pages/RefundDispute';
import StrikeCreator from './pages/StrikeCreator';
import DismissDispute from './pages/DismissDispute';
import CreatorHealth from './pages/CreatorHealth';
import PlatformAnalytics from './pages/PlatformAnalytics';
import BuyerManagement from './pages/BuyerManagement';
import ConfirmBlock from './pages/ConfirmBlock';
import UnbanBuyer from './pages/UnbanBuyer';
import AdminAlerts from './pages/AdminAlerts';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';

// Authentication guard
const ProtectedRoute = ({ isAdmin }) => {
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin onLogin={() => setIsAdmin(true)} />} />
        
        <Route path="/admin" element={<ProtectedRoute isAdmin={isAdmin} />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="verification" element={<VerificationQueue />} />
            <Route path="verification/approve/:username" element={<ApproveCreator />} />
            <Route path="verification/reject/:username" element={<RejectCreator />} />
            <Route path="dispute/:id" element={<DisputeScreen />} />
            <Route path="dispute/:id/refund" element={<RefundDispute />} />
            <Route path="dispute/:id/strike" element={<StrikeCreator />} />
            <Route path="dispute/:id/dismiss" element={<DismissDispute />} />
            <Route path="creators" element={<CreatorHealth />} />
            <Route path="analytics" element={<PlatformAnalytics />} />
            <Route path="buyers" element={<BuyerManagement />} />
            <Route path="buyers/confirm-block" element={<ConfirmBlock />} />
            <Route path="buyers/unban" element={<UnbanBuyer />} />
            <Route path="alerts" element={<AdminAlerts />} />
            <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

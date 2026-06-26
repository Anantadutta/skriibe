import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ApproveCreator from './pages/ApproveCreator';
import RejectCreator from './pages/RejectCreator';
import CreatorDisputes from './pages/CreatorDisputes';
import CreatorDisputeScreen from './pages/CreatorDisputeScreen';
import BuyerDisputes from './pages/BuyerDisputes';
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
import OpenQuestions from './pages/OpenQuestions';
import Transactions from './pages/Transactions';
import DeletionPauseReasons from './pages/DeletionPauseReasons';
import CommissionSettings from './pages/CommissionSettings';
import CreatorBankDetails from './pages/CreatorBankDetails';
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
            <Route path="verification/approve/:username" element={<ApproveCreator />} />
            <Route path="verification/reject/:username" element={<RejectCreator />} />
            <Route path="dispute/:id" element={<DisputeScreen />} />
            <Route path="dispute/:id/refund" element={<RefundDispute />} />
            <Route path="dispute/:id/strike" element={<StrikeCreator />} />
            <Route path="dispute/:id/dismiss" element={<DismissDispute />} />
            <Route path="creators" element={<CreatorHealth />} />
            <Route path="open-questions" element={<OpenQuestions />} />
            <Route path="buyers" element={<BuyerManagement />} />
            <Route path="creator-disputes" element={<CreatorDisputes />} />
            <Route path="creator-dispute/:id" element={<CreatorDisputeScreen />} />
            <Route path="buyer-disputes" element={<BuyerDisputes />} />
            <Route path="analytics" element={<PlatformAnalytics />} />
            <Route path="buyers/confirm-block" element={<ConfirmBlock />} />
            <Route path="buyers/unban" element={<UnbanBuyer />} />
            <Route path="alerts" element={<AdminAlerts />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="account-actions" element={<DeletionPauseReasons />} />
            <Route path="commission" element={<CommissionSettings />} />
            <Route path="bank-details" element={<CreatorBankDetails />} />
            <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

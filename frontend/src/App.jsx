import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DMCounter from './components/DMCounter';
import StorySteps from './components/StorySteps';
import FlowGraphic from './components/FlowGraphic';
import WaitlistForm from './components/WaitlistForm';
import Footer from './components/Footer';

// Context
import { CreatorOnboardingProvider } from './context/CreatorOnboardingContext';
import { AuthProvider } from './context/AuthContext';

// Pages
import About from './pages/About';
import Mission from './pages/Mission';
import Vision from './pages/Vision';
import ComponentShowcase from './pages/dev/ComponentShowcase';
import CreatorSignup from './pages/creator/CreatorSignup';
import CreatorLogin from './pages/creator/CreatorLogin';
import CreatorForgotPassword from './pages/creator/CreatorForgotPassword';
import CreatorResetPassword from './pages/creator/CreatorResetPassword';
import CreatorVerifyOTP from './pages/creator/CreatorVerifyOTP';
import CreatorConnectInstagram from './pages/creator/CreatorConnectInstagram';
import CreatorOnboardProfile from './pages/creator/CreatorOnboardProfile';
import CreatorOnboardPricing from './pages/creator/CreatorOnboardPricing';
import CreatorGoLive from './pages/creator/CreatorGoLive';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorReplyScreen from './pages/CreatorReplyScreen';
import CreatorInbox from './pages/stubs/CreatorInbox';
import CreatorAnalytics from './pages/stubs/CreatorAnalytics';
import CreatorPayouts from './pages/creator/CreatorPayouts';
import CreatorSetupPayouts from './pages/stubs/CreatorPayouts';
import CreatorSettings from './pages/stubs/CreatorSettings';
import CreatorAccountHealth from './pages/stubs/CreatorAccountHealth';
import CreatorDeleteQuestion from './pages/stubs/CreatorDeleteQuestion';
import CreatorSharePage from './pages/creator/CreatorSharePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCreators from './pages/admin/AdminCreators';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import BuyerHistoryPage from './pages/buyer/BuyerHistoryPage';
import BuyerQuestionPage from './pages/buyer/BuyerQuestionPage';
import DemoAnswerPage from './pages/buyer/DemoAnswerPage';
import FlagSubmittedPage from './pages/buyer/FlagSubmittedPage';
// Fan Flow
import FanSignup from './pages/fan/FanSignup';
import FanLogin from './pages/fan/FanLogin';
import FanForgotPassword from './pages/fan/FanForgotPassword';
import FanResetPassword from './pages/fan/FanResetPassword';
import ChooseRole from './pages/fan/ChooseRole';
import FanDiscovery from './pages/fan/FanDiscovery';
import FanExplore from './pages/fan/FanExplore';
import FanHistory from './pages/fan/FanHistory';
import FanNotifications from './pages/fan/FanNotifications';
import FanProfile from './pages/fan/FanProfile';
import FanToCreatorUpgrade from './pages/fan/FanToCreatorUpgrade';
import CreatorProfile from './pages/fan/CreatorProfile';

const CreatorRoute = () => {
  return <Outlet />;
};

const AdminRoute = () => {
  return <Outlet />;
};

function LandingPage({ theme, toggleTheme }) {
  const location = useLocation();
  const showDeletedToast = location.state?.accountDeleted;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="relative flex flex-col">
        <Hero />
      </div>
      <DMCounter theme={theme} />
      <StorySteps theme={theme} />
      <FlowGraphic />
      <WaitlistForm />
      <Footer theme={theme} />

      {/* Account Deleted Toast */}
      {showDeletedToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ef4444',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          zIndex: 9999,
          animation: 'slideUpToast 0.3s ease-out'
        }}>
          Your account has been deleted
        </div>
      )}
      <style>{`
        @keyframes slideUpToast {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function App() {
  // Extract token synchronously before any child components render
  if (typeof window !== 'undefined' && window.location.hash.includes('token=')) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get('token');
    if (token) {
      localStorage.setItem('skriibe_token', token);
      // Clean up the URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
      document.documentElement.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <AuthProvider>
      <CreatorOnboardingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/about" element={<About />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/vision" element={<Vision />} />
            
            {/* Creator Onboarding */}
            <Route path="/creator/signup" element={<CreatorSignup />} />
            <Route path="/creator/login" element={<CreatorLogin />} />
            <Route path="/creator/forgot-password" element={<CreatorForgotPassword />} />
            <Route path="/creator/reset-password/:token" element={<CreatorResetPassword />} />
            <Route path="/creator/verify-otp" element={<CreatorVerifyOTP />} />
            <Route path="/creator/connect-instagram" element={<CreatorConnectInstagram />} />
            <Route path="/onboard/profile" element={<CreatorOnboardProfile />} />
            <Route path="/creator/onboarding/profile" element={<CreatorOnboardProfile />} />
            <Route path="/onboard/pricing" element={<CreatorOnboardPricing />} />
            {/* <Route path="/onboard/live" element={<CreatorGoLive />} /> */}

            {/* Fan Flow */}
            <Route path="/fan/login" element={<FanLogin />} />
            <Route path="/fan/signup" element={<FanSignup />} />
            <Route path="/fan/forgot-password" element={<FanForgotPassword />} />
            <Route path="/fan/reset-password/:token" element={<FanResetPassword />} />
            <Route path="/fan/history" element={<FanHistory />} />
            <Route path="/fan/notifications" element={<FanNotifications />} />
            <Route path="/choose-role" element={<ChooseRole />} />
            <Route path="/discovery" element={<FanDiscovery />} />
            <Route path="/explore" element={<FanDiscovery />} />
            <Route path="/fan/profile" element={<FanProfile />} />
            <Route path="/fan/upgrade" element={<FanToCreatorUpgrade />} />
            <Route path="/creator/:handle" element={<CreatorProfile />} />
            
            <Route element={<CreatorRoute />}>
              <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              <Route path="/creator/dashboard/reply/:id" element={<CreatorReplyScreen />} />
              <Route path="/creator/inbox/delete/:id" element={<CreatorDeleteQuestion />} />
              <Route path="/creator/inbox" element={<CreatorInbox />} />
              <Route path="/creator/analytics" element={<CreatorAnalytics />} />
              <Route path="/creator/payouts" element={<CreatorPayouts />} />
              <Route path="/creator/setup-payouts" element={<CreatorSetupPayouts />} />
              <Route path="/creator/settings" element={<CreatorSettings />} />
              <Route path="/creator/health" element={<CreatorAccountHealth />} />
              
              {/* Redirects for legacy routes to keep UX seamless */}
              <Route path="/dashboard" element={<Navigate to="/creator/dashboard" replace />} />
              <Route path="/inbox" element={<Navigate to="/creator/inbox" replace />} />
              <Route path="/analytics" element={<Navigate to="/creator/analytics" replace />} />
              <Route path="/payouts" element={<Navigate to="/creator/payouts" replace />} />
              <Route path="/settings" element={<Navigate to="/creator/settings" replace />} />
              
              <Route path="/dashboard/share" element={<CreatorSharePage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/creators" element={<AdminCreators />} />
              <Route path="/admin/disputes" element={<AdminDisputes />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>

            <Route path="/dev/components" element={<ComponentShowcase />} />

            {/* Wildcard username dashboard route */}
            <Route path="/@:username" element={<CreatorDashboard />} />

            {/* Buyer History & Single Question */}
            <Route path="/history" element={<BuyerHistoryPage />} />
            <Route path="/:handle/question/:id" element={<BuyerQuestionPage />} />
            <Route path="/:handle/demo-answer" element={<DemoAnswerPage />} />
            <Route path="/:handle/flag-submitted" element={<FlagSubmittedPage />} />

            {/* Fan Flow (Catch-All) */}
            <Route path="/:handle" element={<CreatorProfile />} />
          </Routes>
        </BrowserRouter>
      </CreatorOnboardingProvider>
    </AuthProvider>
  );
}

export default App;

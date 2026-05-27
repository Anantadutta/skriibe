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

// Pages
import ComponentShowcase from './pages/dev/ComponentShowcase';
import CreatorSignup from './pages/creator/CreatorSignup';
import CreatorVerifyOTP from './pages/creator/CreatorVerifyOTP';
import CreatorConnectInstagram from './pages/creator/CreatorConnectInstagram';
import CreatorOnboardProfile from './pages/creator/CreatorOnboardProfile';
import CreatorOnboardPricing from './pages/creator/CreatorOnboardPricing';
import CreatorGoLive from './pages/creator/CreatorGoLive';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorReplyScreen from './pages/CreatorReplyScreen';
import CreatorInbox from './pages/stubs/CreatorInbox';
import CreatorAnalytics from './pages/stubs/CreatorAnalytics';
import CreatorPayouts from './pages/stubs/CreatorPayouts';
import CreatorSettings from './pages/stubs/CreatorSettings';
import CreatorAccountHealth from './pages/stubs/CreatorAccountHealth';
import CreatorSharePage from './pages/creator/CreatorSharePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCreators from './pages/admin/AdminCreators';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CreatorPublicPage from './pages/buyer/CreatorPublicPage';

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
        <div className="absolute bottom-6 w-full flex justify-center z-20">
          <Link 
            to="/creator/signup" 
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--white)',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = 'var(--blue)'; e.target.style.color = 'var(--blue)'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = 'var(--white)'; }}
          >
            I'm a creator — ask me anything →
          </Link>
        </div>
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
    <CreatorOnboardingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage theme={theme} toggleTheme={toggleTheme} />} />
          
          {/* Creator Onboarding */}
          <Route path="/creator/signup" element={<CreatorSignup />} />
          <Route path="/creator/verify-otp" element={<CreatorVerifyOTP />} />
          <Route path="/creator/connect-instagram" element={<CreatorConnectInstagram />} />
          <Route path="/onboard/profile" element={<CreatorOnboardProfile />} />
          <Route path="/creator/onboarding/profile" element={<CreatorOnboardProfile />} />
          <Route path="/onboard/pricing" element={<CreatorOnboardPricing />} />
          {/* <Route path="/onboard/live" element={<CreatorGoLive />} /> */}
          
          <Route element={<CreatorRoute />}>
            <Route path="/creator/dashboard" element={<CreatorDashboard />} />
            <Route path="/creator/dashboard/reply/:id" element={<CreatorReplyScreen />} />
            <Route path="/creator/inbox" element={<CreatorInbox />} />
            <Route path="/creator/analytics" element={<CreatorAnalytics />} />
            <Route path="/creator/payouts" element={<CreatorPayouts />} />
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

          {/* Buyer Flow (Catch-All) */}
          <Route path="/:handle" element={<CreatorPublicPage />} />
        </Routes>
      </BrowserRouter>
    </CreatorOnboardingProvider>
  );
}

export default App;

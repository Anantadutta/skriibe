import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
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
import CreatorDashboard from './pages/creator/CreatorDashboard';
import CreatorInbox from './pages/creator/CreatorInbox';
import CreatorReply from './pages/creator/CreatorReply';
import CreatorPayouts from './pages/creator/CreatorPayouts';
import CreatorSettings from './pages/creator/CreatorSettings';
import CreatorSharePage from './pages/creator/CreatorSharePage';
import CreatorAnalytics from './pages/creator/CreatorAnalytics';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCreators from './pages/admin/AdminCreators';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CreatorPublicPage from './pages/buyer/CreatorPublicPage';

const CreatorRoute = () => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    fetch('http://localhost:5000/api/creator/me', {
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 200) setStatus('auth');
        else setStatus('unauth');
      })
      .catch(() => setStatus('unauth'));
  }, []);

  if (status === 'checking') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--ink)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          width: 32, 
          height: 32, 
          borderRadius: '50%', 
          border: '3px solid var(--ink5)', 
          borderTopColor: 'var(--blue)', 
          animation: 'spin 0.8s linear infinite' 
        }} />
      </div>
    );
  }

  if (status === 'unauth') return <Navigate to="/creator/signup" replace />;
  return <Outlet />;
};

const AdminRoute = () => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/me', {
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 200) setStatus('auth');
        else setStatus('unauth');
      })
      .catch(() => setStatus('unauth'));
  }, []);

  if (status === 'checking') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--ink)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          width: 32, 
          height: 32, 
          borderRadius: '50%', 
          border: '3px solid var(--ink5)', 
          borderTopColor: 'var(--blue)', 
          animation: 'spin 0.8s linear infinite' 
        }} />
      </div>
    );
  }

  if (status === 'unauth') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

function LandingPage({ theme, toggleTheme }) {
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
          <Route path="/creator/onboarding/profile" element={<CreatorOnboardProfile />} />
          <Route path="/onboard/pricing" element={<CreatorOnboardPricing />} />
          <Route path="/onboard/live" element={<CreatorGoLive />} />
          
          <Route element={<CreatorRoute />}>
            <Route path="/dashboard" element={<CreatorDashboard />} />
            <Route path="/dashboard/share" element={<CreatorSharePage />} />
            <Route path="/inbox" element={<CreatorInbox />} />
            <Route path="/analytics" element={<CreatorAnalytics />} />
            <Route path="/payouts" element={<CreatorPayouts />} />
            <Route path="/settings" element={<CreatorSettings />} />
            <Route path="/creator/reply/:questionId" element={<CreatorReply />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/creators" element={<AdminCreators />} />
            <Route path="/admin/disputes" element={<AdminDisputes />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>

          <Route path="/dev/components" element={<ComponentShowcase />} />

          {/* Buyer Flow (Catch-All) */}
          <Route path="/:handle" element={<CreatorPublicPage />} />
        </Routes>
      </BrowserRouter>
    </CreatorOnboardingProvider>
  );
}

export default App;

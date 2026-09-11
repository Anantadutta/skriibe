import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DMCounter from './components/DMCounter';
import StorySteps from './components/StorySteps';
import FlowGraphic from './components/FlowGraphic';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import WhosOnline from './components/WhosOnline';
import HowItWorksSection from './components/HowItWorksSection';
import InsideChatSection from './components/InsideChatSection';
import NewFansOnly from './components/NewFansOnly';
import ForCreatorsSection from './components/ForCreatorsSection';
import StopTypingSection from './components/StopTypingSection';
import HeroChatSimulation from './components/HeroChatSimulation';

// Context
import { CreatorOnboardingProvider } from './context/CreatorOnboardingContext';
import { AuthProvider } from './context/AuthContext';
import SmartLoginRedirect from './components/SmartLoginRedirect';

// Pages
import About from './pages/About';
import Mission from './pages/Mission';
import Vision from './pages/Vision';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refunds from './pages/Refunds';
import ComponentShowcase from './pages/dev/ComponentShowcase';
import Agreement from './pages/Agreement';
import Guidelines from './pages/Guidelines';
import Cookies from './pages/Cookies';
import FAQPage from './pages/FAQPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactUs from './pages/ContactUs';
import RaiseQuery from './pages/RaiseQuery';
import CreatorSignup from './pages/creator/CreatorSignup';
import CreatorLogin from './pages/creator/CreatorLogin';
import CreatorForgotPassword from './pages/creator/CreatorForgotPassword';
import CreatorResetPassword from './pages/creator/CreatorResetPassword';
import CreatorVerifyOTP from './pages/creator/CreatorVerifyOTP';
import CreatorConnectInstagram from './pages/creator/CreatorConnectInstagram';
import CreatorOnboardProfile from './pages/creator/CreatorOnboardProfile';
import CreatorOnboardPricing from './pages/creator/CreatorOnboardPricing';
import CreatorOnboardLiveChat from './pages/creator/CreatorOnboardLiveChat';
import CreatorGoLive from './pages/creator/CreatorGoLive';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorReplyScreen from './pages/CreatorReplyScreen';
import CreatorInbox from './pages/stubs/CreatorInbox';
import CreatorAnalytics from './pages/stubs/CreatorAnalytics';
import CreatorPayouts from './pages/creator/CreatorPayouts';
import CreatorSetupPayouts from './pages/stubs/CreatorPayouts';
import CreatorSettings from './pages/stubs/CreatorSettings';
import CreatorNotifications from './pages/CreatorNotifications';
import CreatorAccountHealth from './pages/stubs/CreatorAccountHealth';
import CreatorDeleteQuestion from './pages/stubs/CreatorDeleteQuestion';
import CreatorSharePage from './pages/creator/CreatorSharePage';
import CreatorScheduling from './pages/creator/CreatorScheduling';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCreators from './pages/admin/AdminCreators';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminQueries from './pages/admin/AdminQueries';
import BuyerHistoryPage from './pages/buyer/BuyerHistoryPage';
import BuyerQuestionPage from './pages/buyer/BuyerQuestionPage';
import DemoAnswerPage from './pages/buyer/DemoAnswerPage';
import FlagSubmittedPage from './pages/buyer/FlagSubmittedPage';
import AffiliateProgram from './pages/AffiliateProgram';
// Fan Flow
import FanSignup from './pages/fan/FanSignup';
import FanLogin from './pages/fan/FanLogin';
import FanForgotPassword from './pages/fan/FanForgotPassword';
import FanResetPassword from './pages/fan/FanResetPassword';
import ChooseRole from './pages/fan/ChooseRole';
import FanDiscovery from './pages/fan/FanDiscovery';
import FanExplore from './pages/fan/FanExplore';
import FanHistory from './pages/fan/FanHistory';
import PastChatView from './pages/fan/PastChatView';
import FanNotifications from './pages/fan/FanNotifications';
import FanProfile from './pages/fan/FanProfile';
import FanToCreatorUpgrade from './pages/fan/FanToCreatorUpgrade';
import CreatorProfile from './pages/fan/CreatorProfile';
import FanWalletRechargePage from './pages/fan/FanWalletRechargePage';
import FanWallet from './pages/fan/FanWallet';
import LiveChatInterface from './pages/fan/LiveChatInterface';
import EmailVerificationFlow from './pages/EmailVerificationFlow';
import ErrorBoundary from './components/ErrorBoundary';

import CreatorLiveChat from './pages/CreatorLiveChat';

const CreatorRoute = () => {
  return <Outlet />;
};

const ProtectedRoute = ({ children, allowedRole }) => {
  return <Outlet />;
};

const AdminRoute = () => {
  return <Outlet />;
};

const TOPICS = ['Fitness', 'Lifestyle', 'Finance', 'Education', 'Tech', 'Dating', 'Entertainment'];

function LandingPage({ theme, toggleTheme }) {
  const location = useLocation();
  const [showDeletedToast, setShowDeletedToast] = useState(false);
  const [topicIndex, setTopicIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTopicIndex((prev) => (prev + 1) % TOPICS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.state?.accountDeleted) {
      setShowDeletedToast(true);
      const timer = setTimeout(() => {
        setShowDeletedToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.accountDeleted]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id) || (id === 'creators' ? document.getElementById('whos-online') : null);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120);
      }
    }
  }, [location.hash]);

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-1 w-full px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 pb-4 sm:pb-8 flex flex-col items-start">
        {/* Top Hero Section with Left Content & Right Simulated Live Chat */}
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 lg:gap-8 xl:gap-12">
          {/* Left Column: Badge, Heading, Bullets */}
          <div className="flex-1 flex flex-col items-start w-full">
            {/* Free Chat Badge (under Skriibe logo) */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm md:text-[15px] font-semibold transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-sky-50 border-[#3BA8D8] text-[#0284c7] shadow-sm'
                  : 'bg-[#08131e] border-[#3BA8D8] text-[#3BA8D8] shadow-[0_0_15px_rgba(59,168,216,0.2)]'
              }`}
            >
              <span className="text-sm sm:text-base leading-none select-none">🎁</span>
              <span>your first Chat is free</span>
            </div>

            {/* Big Hero Heading & Word Rotator */}
            <div
              className={`mt-6 sm:mt-8 text-5xl sm:text-7xl md:text-8xl lg:text-7xl xl:text-[104px] 2xl:text-[118px] uppercase tracking-tight leading-[0.85] ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              <h1>
                TALK TO YOUR<br />
                FAVOURITE CREATOR
              </h1>
              <div className="mt-3 sm:mt-5 flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-2">
                <span>ASK ABOUT</span>
                <motion.span
                  layout
                  transition={{ layout: { duration: 0.25, ease: 'easeOut' } }}
                  className="inline-flex items-center justify-center px-3 sm:px-5 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl bg-[#3BA8D8] text-black shadow-[0_0_20px_rgba(59,168,216,0.35)] overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={TOPICS[topicIndex]}
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -24, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="inline-block"
                    >
                      {TOPICS[topicIndex].toUpperCase()}
                    </motion.span>
                  </AnimatePresence>
                </motion.span>
              </div>
            </div>

            {/* Bullet Points */}
            <div className="mt-8 sm:mt-10 flex flex-col gap-3.5">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3BA8D8] text-black flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(59,168,216,0.35)]">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className={`text-base sm:text-lg md:text-xl font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                  Your chats are Private
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3BA8D8] text-black flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(59,168,216,0.35)]">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className={`text-base sm:text-lg md:text-xl font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                  No DMs required
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3BA8D8] text-black flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(59,168,216,0.35)]">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className={`text-base sm:text-lg md:text-xl font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                  Pay Per Minute
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Live Chat Mobile Screen */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-end shrink-0 self-center lg:self-start lg:pt-1 lg:mr-8 xl:mr-16 2xl:mr-24">
            <HeroChatSimulation theme={theme} />
          </div>
        </div>

        {/* Marquee Tape Banner */}
        <div className="w-full overflow-hidden bg-[#3BA8D8] py-3 sm:py-4 mt-12 sm:mt-16 mb-6 select-none -mx-4 sm:-mx-6 md:-mx-12 !w-[calc(100%+2rem)] sm:!w-[calc(100%+3rem)] md:!w-[calc(100%+6rem)] shadow-[0_0_25px_rgba(59,168,216,0.3)]">
          <div
            className="flex whitespace-nowrap will-change-transform"
            style={{ animation: 'marquee 25s linear infinite' }}
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center shrink-0">
                {TOPICS.map((topic, idx) => (
                  <span key={idx} className="flex items-center">
                    <span
                      className="text-black font-normal uppercase text-2xl sm:text-3xl md:text-4xl tracking-wider"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {topic}
                    </span>
                    <span className="mx-4 sm:mx-6 text-black/70 text-lg sm:text-2xl font-bold">
                      •
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Who's Online Section */}
        <WhosOnline theme={theme} />

        {/* How It Works Section */}
        <HowItWorksSection theme={theme} />

        {/* Inside A Chat Section */}
        <InsideChatSection theme={theme} />

        {/* New Fans Only Section */}
        <NewFansOnly theme={theme} />

        {/* FAQs Section */}
        <FAQ theme={theme} />

        {/* For Creators Section */}
        <ForCreatorsSection theme={theme} />

        {/* Stop Typing Section */}
        <StopTypingSection theme={theme} />
      </main>

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
            <Route path="/" element={
              <ErrorBoundary>
                <LandingPage theme={theme} toggleTheme={toggleTheme} />
              </ErrorBoundary>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/vision" element={<Vision />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/raise-query" element={<RaiseQuery />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/faqs" element={<FAQPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/agreement" element={<Agreement />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/verify-email" element={<EmailVerificationFlow />} />
            <Route path="/affiliate" element={<AffiliateProgram theme={theme} />} />
            
            {/* Creator Onboarding */}
            <Route path="/creator/signup" element={<CreatorSignup />} />
            <Route path="/creator/login" element={
              <SmartLoginRedirect>
                <CreatorLogin />
              </SmartLoginRedirect>
            } />
            <Route path="/creator/forgot-password" element={<CreatorForgotPassword />} />
            <Route path="/creator/reset-password/:token" element={<CreatorResetPassword />} />
            <Route path="/creator/verify-otp" element={<CreatorVerifyOTP />} />
            <Route path="/creator/connect-instagram" element={<CreatorConnectInstagram />} />
            <Route path="/onboard/profile" element={<CreatorOnboardProfile />} />
            <Route path="/onboard/live-chat" element={<CreatorOnboardLiveChat />} />
            <Route path="/onboard/pricing" element={<CreatorOnboardPricing />} />
            {/* <Route path="/onboard/live" element={<CreatorGoLive />} /> */}

            {/* Fan Flow */}
            <Route path="/fan/login" element={<FanLogin />} />
            <Route path="/fan/signup" element={<FanSignup />} />
            <Route path="/fan/forgot-password" element={<FanForgotPassword />} />
            <Route path="/fan/reset-password/:token" element={<FanResetPassword />} />
            <Route path="/fan/history" element={<FanHistory />} />
            <Route path="/fan/history/chat/:sessionId" element={<PastChatView />} />
            <Route path="/fan/notifications" element={<FanNotifications />} />
            <Route path="/choose-role" element={<ChooseRole />} />
            <Route path="/discovery" element={<FanDiscovery />} />
            <Route path="/explore" element={<FanExplore />} />
            <Route path="/fan/profile" element={<FanProfile />} />
            <Route path="/fan/wallet" element={<FanWallet />} />
            <Route path="/fan/upgrade" element={<FanToCreatorUpgrade />} />
            <Route path="/creator/:handle" element={<CreatorProfile />} />
            <Route path="/:handle/live-chat" element={<LiveChatInterface />} />
            <Route path="/:handle/recharge" element={<FanWalletRechargePage />} />
            
            <Route element={<CreatorRoute />}>
              <Route path="/creator/dashboard" element={
                <ErrorBoundary>
                  <CreatorDashboard />
                </ErrorBoundary>
              } />
              <Route path="/creator/dashboard/reply/:id" element={<CreatorReplyScreen />} />
              <Route path="/creator/dashboard/live-chat/:sessionId" element={<CreatorLiveChat />} />
              <Route path="/creator/inbox/delete/:id" element={<CreatorDeleteQuestion />} />
              <Route path="/creator/inbox" element={<CreatorInbox />} />
              <Route path="/creator/analytics" element={<CreatorAnalytics />} />
              <Route path="/creator/payouts" element={<CreatorPayouts />} />
              <Route path="/creator/setup-payouts" element={<CreatorSetupPayouts />} />
              <Route path="/creator/settings" element={<CreatorSettings />} />
              <Route path="/creator/scheduling" element={<CreatorScheduling />} />
              <Route path="/creator/health" element={<CreatorAccountHealth />} />
              <Route path="/creator/notifications" element={<CreatorNotifications />} />
              
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
              <Route path="/admin/queries" element={<AdminQueries />} />
            </Route>

            <Route path="/dev/components" element={<ComponentShowcase />} />

            {/* Public profile route with @ prefix */}
            <Route path="/@:handle" element={<CreatorProfile />} />

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

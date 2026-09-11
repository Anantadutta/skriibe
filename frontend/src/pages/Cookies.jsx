import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Cookies = () => {
  const navigate = useNavigate();
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
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-[#f8fafc] text-black' : 'bg-[#0a0a0f] text-white'} flex flex-col`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-grow flex flex-col items-center p-6 sm:p-12 relative overflow-hidden font-syne">
        <div className="z-10 max-w-4xl w-full space-y-6 p-8 md:p-12 rounded-3xl text-left" style={{
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: theme === 'light' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: theme === 'light' ? '0 20px 40px rgba(0,0,0,0.05)' : '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <button 
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#3BA8D8] to-[#7c3aed] mb-8 text-center break-words">
            Cookie Policy
          </h1>
          
          <div className={`text-base md:text-lg leading-relaxed space-y-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} font-sans`}>
            <p className="font-semibold">Last Updated: September 2026</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>1. What Are Cookies?</h2>
            <p>Cookies are small text files placed on your device (computer, phone, or tablet) by websites and apps when you visit them. They help the site remember your preferences and actions, improve performance, and allow us to understand how users interact with the platform. Similar technologies — including pixel tags, web beacons, local storage, and session storage — work in a comparable way and are also covered by this Cookie Policy.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2. Why Skriibe Uses Cookies</h2>
            <p>Skriibe uses cookies and similar technologies for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential operation:</strong> to keep you logged in, maintain your session, and enable core platform features.</li>
              <li><strong>Security:</strong> to detect and prevent fraud, abuse, and unauthorised access.</li>
              <li><strong>Performance and analytics:</strong> to understand how users navigate the platform, which features are used most, and where errors occur — so we can improve the product.</li>
              <li><strong>Preferences:</strong> to remember your settings, language, and display preferences.</li>
              <li><strong>Marketing (where you have consented):</strong> to understand the effectiveness of our promotional campaigns.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3. Categories of Cookies We Use</h2>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3.1 Essential Cookies</h3>
            <p>These cookies are strictly necessary for the Skriibe platform to function. You cannot opt out of these cookies without affecting platform functionality. They do not collect personal data for advertising purposes.</p>

            <div className="overflow-x-auto my-6">
              <table className={`w-full border-collapse border text-sm md:text-base ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-700 bg-white/[0.02]'}`}>
                <thead>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300 bg-[#f0f4fa]' : 'border-gray-700 bg-white/[0.06]'}`}>
                    <th className={`w-1/4 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Cookie Name
                    </th>
                    <th className={`w-1/6 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Category
                    </th>
                    <th className={`w-5/12 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Purpose
                    </th>
                    <th className={`w-1/6 px-4 py-3 text-left font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      skriibe_session
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Essential
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Maintains your login session and keeps you authenticated
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Session (deleted on browser close)
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      skriibe_csrf
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Essential
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Prevents cross-site request forgery attacks
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Session
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      skriibe_device
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Essential
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Identifies your device for security and fraud prevention
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      1 year
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      skriibe_free_trial
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Essential
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Tracks whether your one-time free chat trial has been used
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Permanent (until account deletion)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3.2 Functional / Preference Cookies</h3>
            <p>These cookies remember your preferences and improve your experience. They are not strictly necessary but significantly improve usability.</p>

            <div className="overflow-x-auto my-6">
              <table className={`w-full border-collapse border text-sm md:text-base ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-700 bg-white/[0.02]'}`}>
                <thead>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300 bg-[#f0f4fa]' : 'border-gray-700 bg-white/[0.06]'}`}>
                    <th className={`w-1/4 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Cookie Name
                    </th>
                    <th className={`w-1/6 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Category
                    </th>
                    <th className={`w-5/12 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Purpose
                    </th>
                    <th className={`w-1/6 px-4 py-3 text-left font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      skriibe_lang
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Functional
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Remembers your language preference
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      1 year
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      skriibe_theme
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Functional
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Remembers your display preferences (e.g. dark/light mode)
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      1 year
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      skriibe_notif
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Functional
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Stores your notification preferences
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      6 months
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3.3 Analytics Cookies</h3>
            <p>These cookies collect aggregated, anonymised data about how users interact with Skriibe. We use this information to improve platform performance and user experience. Analytics cookies require your consent before being set (except where they are strictly anonymised and cannot identify you).</p>

            <div className="overflow-x-auto my-6">
              <table className={`w-full border-collapse border text-sm md:text-base ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-700 bg-white/[0.02]'}`}>
                <thead>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300 bg-[#f0f4fa]' : 'border-gray-700 bg-white/[0.06]'}`}>
                    <th className={`w-1/4 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Cookie Name
                    </th>
                    <th className={`w-1/6 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Category
                    </th>
                    <th className={`w-5/12 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Purpose
                    </th>
                    <th className={`w-1/6 px-4 py-3 text-left font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      _ga / _ga_*
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Analytics
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Google Analytics — tracks page views, session duration, and user journeys in anonymised form
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      2 years
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      _gid
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Analytics
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Google Analytics — distinguishes users for session tracking
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      24 hours
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      skriibe_ab
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Analytics
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      A/B testing — tracks which feature variant you are seeing
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      30 days
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3.4 Marketing / Advertising Cookies</h3>
            <p>These cookies are used to measure the effectiveness of Skriibe's marketing campaigns and may be set by third-party advertising partners. These cookies require your explicit consent before being set. If you do not consent, these cookies will not be placed.</p>

            <div className="overflow-x-auto my-6">
              <table className={`w-full border-collapse border text-sm md:text-base ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-700 bg-white/[0.02]'}`}>
                <thead>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300 bg-[#f0f4fa]' : 'border-gray-700 bg-white/[0.06]'}`}>
                    <th className={`w-1/4 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Cookie Name
                    </th>
                    <th className={`w-1/6 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Category
                    </th>
                    <th className={`w-5/12 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Purpose
                    </th>
                    <th className={`w-1/6 px-4 py-3 text-left font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      _fbp
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Marketing
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Meta (Facebook) Pixel — tracks conversions from Meta ads
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      90 days
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      _gcl_au
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Marketing
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Google Ads conversion tracking
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      90 days
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>If we introduce additional third-party analytics or marketing tools in future, this Cookie Policy will be updated to reflect them.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4. Your Consent &amp; Choices</h2>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4.1 Cookie Consent Banner</h3>
            <p>When you first visit skriibe.com or use the Skriibe app, you will see a cookie consent notice. You can:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Accept all cookies</strong> — allows Essential, Functional, Analytics, and Marketing cookies.</li>
              <li><strong>Accept essential cookies only</strong> — allows only Essential cookies; Analytics and Marketing cookies will not be set.</li>
              <li><strong>Manage preferences</strong> — allows you to choose which categories of cookies you accept.</li>
            </ul>
            <p>Your consent preference is stored in a cookie (<code>skriibe_consent</code>) and respected on all subsequent visits. You can change your preferences at any time via the Cookie Settings link in the platform footer.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4.2 Browser Controls</h3>
            <p>You can also manage cookies through your <strong>browser settings</strong>. Most browsers allow you to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>View cookies currently stored on your device</li>
              <li>Delete all or selected cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block all third-party cookies</li>
            </ul>
            <p>Please note: blocking <strong>essential cookies</strong> will significantly impair or prevent your use of the Skriibe platform. Instructions for managing cookies in common browsers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
              <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
              <li><strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
              <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4.3 Opt-Out of Google Analytics</h3>
            <p>You can opt out of Google Analytics tracking across all websites by installing the Google Analytics Opt-out Browser Add-on available at: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#3BA8D8] hover:underline font-medium">tools.google.com/dlpage/gaoptout</a></p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5. Third-Party Cookies</h2>
            <p>Some cookies on the Skriibe platform are set by third parties — companies that provide services to Skriibe such as analytics (Google Analytics), payment processing (Razorpay), and potentially advertising platforms. Skriibe does not control these third-party cookies. Please refer to the privacy and cookie policies of the relevant third parties for more information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Analytics:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#3BA8D8] hover:underline font-medium">policies.google.com/privacy</a></li>
              <li><strong>Razorpay:</strong> <a href="https://razorpay.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#3BA8D8] hover:underline font-medium">razorpay.com/privacy</a></li>
              <li><strong>Meta Pixel (if applicable):</strong> <a href="https://facebook.com/policy/cookies" target="_blank" rel="noopener noreferrer" className="text-[#3BA8D8] hover:underline font-medium">facebook.com/policy/cookies</a></li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>6. Data Protection</h2>
            <p>Cookie data that can identify you as an individual is treated as personal data under the Digital Personal Data Protection Act, 2023. It is processed in accordance with Skriibe's Privacy Policy, including the legal bases for processing set out therein. Aggregated, fully anonymised analytics data that cannot be linked to any individual is not treated as personal data.</p>
            <p>Data collected through analytics cookies may be processed by Google's servers, which may be located outside India. This processing is subject to Google's data processing terms and the safeguards described in Skriibe's Privacy Policy.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>7. Cookie Retention Periods</h2>
            <p>Cookies are retained for the durations set out in Section 3 above. Session cookies are automatically deleted when you close your browser. Persistent cookies are stored on your device until they expire or you delete them. You can delete cookies at any time through your browser settings.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>8. Updates to This Cookie Policy</h2>
            <p>Skriibe may update this Cookie Policy when we add new cookies, retire existing ones, or in response to changes in applicable law or regulatory guidance. Material changes will be communicated with at least 7 days' advance notice via the platform or by email. The date of the most recent revision is shown at the top of this document.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>9. Contact</h2>
            <p>For any questions about this Cookie Policy or how we use cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Email:</strong> <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a></li>
              <li><strong>Grievance Officer:</strong> Tarundeep Singh, Founder</li>
              <li><strong>Address:</strong> Edlern Innovations Private Limited, Sector 27 D, Chandigarh – 160019, India</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default Cookies;

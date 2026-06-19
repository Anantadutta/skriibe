import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactUs = () => {
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
      
      <main className="flex-grow flex flex-col items-center p-6 sm:p-12 relative overflow-hidden pt-24 md:pt-32">
        {/* Background effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div style={{
            position: 'absolute',
            width: '150%',
            height: '150%',
            top: '-25%',
            left: '-25%',
            background: 'radial-gradient(circle at 50% 50%, rgba(85, 175, 226, 0.15) 0%, transparent 50%)',
            filter: 'blur(80px)'
          }} />
        </div>

        <div className="z-10 max-w-4xl text-center space-y-8 p-8 w-full" style={{
          boxShadow: theme === 'light' ? '0 20px 40px rgba(0,0,0,0.05)' : '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <button 
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#55afe2] to-[#7c3aed]">
            CONTACT US
          </h1>
          
          <div className="text-lg md:text-xl font-medium leading-relaxed space-y-6 flex flex-col items-center mt-12">
            <p className={`text-base md:text-lg max-w-2xl ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Please contact <a href="mailto:support@skriibe.com" className="text-skriibe-blue hover:underline">support@skriibe.com</a> with questions and a member of our team will review your inquiry & get back to you.
            </p>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default ContactUs;

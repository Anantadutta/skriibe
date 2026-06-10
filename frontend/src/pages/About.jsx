import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
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
      
      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
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

        <div className="z-10 max-w-3xl text-center space-y-10 p-8 md:p-14 rounded-3xl" style={{
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: theme === 'light' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: theme === 'light' ? '0 20px 40px rgba(0,0,0,0.05)' : '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#55afe2] to-[#7c3aed]">
            ABOUT US
          </h1>
          
          <div className="text-lg md:text-xl font-medium leading-relaxed space-y-8 flex flex-col items-center">
            <p className={theme === 'light' ? 'text-gray-800' : 'text-gray-200'}>
              Creators have audiences. Audiences have questions.<br/>
              <span className="font-bold text-[#55afe2] text-2xl inline-block mt-2">Skriibe exists to bridge that gap.</span>
            </p>
            
            <p className={`text-base md:text-lg max-w-xl ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              We're building a place where questions get the attention they deserve, creators get rewarded for their time, and meaningful conversations don't get buried in crowded inboxes.
            </p>
            
            <div className={`italic font-semibold border-l-4 border-[#55afe2] pl-6 py-2 text-left mt-6 max-w-lg ${theme === 'light' ? 'text-gray-700 bg-gray-50' : 'text-gray-300 bg-gray-900'} rounded-r-xl`}>
              Because "Hope they see my DM" isn't really a plan.
            </div>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default About;

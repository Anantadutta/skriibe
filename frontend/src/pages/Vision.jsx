import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Vision = () => {
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

  const values = [
    { num: '01', title: 'Transparency', text: 'No hidden fees, no surprise rules. What you see is exactly what you get.' },
    { num: '02', title: 'Safety first', text: 'Every interaction is moderated. A safe space for creators and fans alike.' },
    { num: '03', title: 'Creator respect', text: 'Creators set their own terms. Their time, their boundaries always.' },
    { num: '04', title: 'Real access', text: 'Not just for the wealthy or well-connected. Skriibe is built for everyone.' }
  ];

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

        {/* Vision Header */}
        <div className="z-10 max-w-4xl text-center space-y-8 p-8 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#55afe2] to-[#7c3aed]">
            VISION
          </h1>
          
          <div className="text-lg md:text-xl font-medium leading-relaxed space-y-6 flex flex-col items-center">
            <p className={`text-xl md:text-2xl font-bold max-w-2xl text-[#55afe2]`}>
              A world where anyone can learn directly from the people they admire.
            </p>
            
            <p className={`text-base md:text-lg max-w-2xl ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              From creators and founders to experts and educators, we're building the simplest way to turn attention into meaningful conversations.
            </p>
          </div>
        </div>

        {/* What We Stand For Section */}
        <div className="z-10 max-w-5xl w-full mt-16 md:mt-24 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 tracking-wide uppercase" style={{ letterSpacing: '0.1em' }}>
            What We Stand For
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((item, idx) => (
              <div key={idx} className={`p-8 rounded-2xl flex flex-col gap-4 transition-all duration-300 ${theme === 'light' ? 'bg-white hover:bg-gray-50 border border-gray-100 shadow-xl shadow-gray-200/50' : 'bg-white/5 hover:bg-white/10 border border-white/5 shadow-2xl shadow-black/50'} backdrop-blur-xl hover:-translate-y-1`}>
                <div className="text-[#55afe2] font-mono text-3xl font-bold opacity-80">
                  {item.num}
                </div>
                <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  {item.title}
                </h3>
                <p className={`text-sm md:text-base ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} leading-relaxed`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default Vision;

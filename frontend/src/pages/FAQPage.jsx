import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { faqData } from '../components/FAQ';

const FAQPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [openIndex, setOpenIndex] = useState(null);

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

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-[#f8fafc] text-black' : 'bg-[#0a0a0f] text-white'} flex flex-col font-syne`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-grow flex flex-col items-center p-6 sm:p-12 relative overflow-hidden">
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

        <div className="z-10 max-w-4xl w-full space-y-8 p-8 rounded-3xl" style={{
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
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#3BA8D8] to-[#7c3aed] mb-8 text-center break-words uppercase">
            All FAQs
          </h1>
          
          <div className="flex flex-col gap-4 mt-8">
            {faqData.map((faq, index) => (
              <div 
                key={index}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-[#38265c]'}`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none"
                >
                  <span className={`text-lg font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{faq.question}</span>
                  <span className={`text-3xl font-light ml-4 transition-transform duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-[#a094ba]'}`} style={{ transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                    +
                  </span>
                </button>
                
                <div 
                  className={`px-6 font-sans transition-all duration-300 ease-in-out ${theme === 'light' ? 'text-gray-600' : 'text-[#94a3b8]'} ${openIndex === index ? 'pb-5 opacity-100 max-h-40' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQPage;

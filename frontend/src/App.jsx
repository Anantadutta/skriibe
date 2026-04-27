import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DMCounter from './components/DMCounter';
import StorySteps from './components/StorySteps';
import FlowGraphic from './components/FlowGraphic';
import Calculator from './components/Calculator';
import WaitlistForm from './components/WaitlistForm';
import Footer from './components/Footer';

import ProofMarquee from './components/ProofMarquee';

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
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <DMCounter />
      <StorySteps theme={theme} />
      <FlowGraphic />
      <Calculator />
      <WaitlistForm />
      <Footer theme={theme} />
    </div>
  );
}

export default App;

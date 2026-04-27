import React from 'react';
import { Sun, Moon } from 'lucide-react';

const Navbar = ({ theme, toggleTheme }) => {
  return (
    <nav className="dark-box sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-black dark:bg-black border-b border-gray-100 dark:border-white/10 backdrop-blur-md transition-colors">
      
      <div className="flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 2800 520.97" 
          className="h-8 w-auto text-white transition-colors"
        >
        
          <text 
  transform="translate(33.52 457.72)" 
  fontSize="566.36px" 
  fontFamily="Garet, sans-serif" 
  fontWeight="400" 
  fill="currentColor"
>
  skr<tspan fill="#55afe2">ii</tspan>be
</text>
        </svg>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-white/10 transition-colors bg-white/5 text-white"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-[#00A3FF]" />}
        </button>
      </div>
      
    </nav>
  );
};

export default Navbar;
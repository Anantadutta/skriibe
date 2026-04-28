import React from 'react';

const Footer = ({ theme }) => {
    return (
        <footer className="px-6 md:px-12 py-10 border-t border-skriibe-d4 flex flex-col items-center justify-center md:flex-row md:justify-between gap-6 bg-black text-white dark-box">
            <div className="flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 2800 520.97" 
                  className="h-8 w-auto transition-colors text-white"
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
            <div className="text-[12px] text-gray-600 font-medium">
                © {new Date().getFullYear()} skriibe · Made in India · For India
            </div>
        </footer>
    );
};

export default Footer;
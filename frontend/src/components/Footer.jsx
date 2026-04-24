import React from 'react';

const Footer = ({ theme }) => {
    return (
        <footer className="px-6 md:px-12 py-10 border-t border-skriibe-d4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 2800 520.97" 
                  className={`h-8 w-auto transition-colors ${theme === 'dark' ? 'text-white' : 'text-[#231f20]'}`}
                >
                  <text 
                    transform="translate(33.52 457.72)" 
                    fontSize="566.36px" 
                    fontFamily="Garet, sans-serif" 
                    fontWeight="700" 
                    fill="currentColor"
                  >
                    skr <tspan fill="#55afe2">ii</tspan>b<tspan dx="100">e</tspan>
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

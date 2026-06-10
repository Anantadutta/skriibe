import React from 'react';

const Footer = ({ theme }) => {
  return (
    <footer className="px-6 md:px-12 py-10 border-t border-skriibe-d4 flex flex-col items-center justify-center gap-6 bg-black text-white dark-box">
      <div className="w-full flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2800 520.97"
          className="h-8 w-auto transition-colors text-white overflow-visible"
        >
          <text
            x="50%"
            y="457.72"
            textAnchor="middle"
            fontSize="566.36px"
            fontFamily="Garet, sans-serif"
            fontWeight="400"
            fill="currentColor"
          >
            skr<tspan fill="#55afe2">ii</tspan>be
          </text>
        </svg>
      </div>
      <div className="flex flex-col items-center gap-3 text-[12px] text-gray-600 font-medium text-center">
        <div>
          Learn more <a href="/about" className="text-[#55afe2] hover:underline">About Us</a>, our driving <a href="/mission" className="text-[#55afe2] hover:underline">Mission</a>, and our ultimate <a href="/vision" className="text-[#55afe2] hover:underline">Vision</a> for the future.
        </div>
        <div>
          © {new Date().getFullYear()} skriibe · Made in India · For India
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DMCounter = ({ theme }) => {
  const [dms, setDms] = useState(0);
  const sectionRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Auto-animate the slider once when it comes into view
      gsap.to({}, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          once: true
        },
        duration: 1.5,
        onUpdate: function () {
          const progress = this.progress();
          // Animate from 0 to 47 (average)
          const newVal = Math.round(progress * 47);
          setDms(newVal);
        },
        ease: "power2.out"
      });

      // Text reveal animation
      gsap.from(".slider-title-char", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "back.out(1.7)"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const sliderPercentage = (dms / 200) * 100;
  const sliderBackground = `linear-gradient(to right, #00A3FF ${sliderPercentage}%, #1e1e1e ${sliderPercentage}%)`;

  return (
    <div ref={sectionRef} className="pt-32 pb-24 px-6 bg-skriibe-d2 border-y border-skriibe-d4 overflow-hidden">
      <div className="max-w-[1000px] mx-auto text-center">
        {/* 1. Combined Title Line */}
        <p className="font-dm uppercase text-[15px] tracking-[0.14em] font-medium mb-12" style={{ color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.35)' }}>
          Unanswered DMs this week — <span style={{ color: theme === 'light' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.7)' }}>MOVE THE SLIDER</span>
        </p>
        {/* 2. Big Number */}
        <div className="relative mb-8 text-center">
          <div
            className={`text-[clamp(180px,25vw,320px)] leading-[0.8] transition-colors duration-500 ${dms > 0 ? 'text-[#FF4D4D]' : 'text-gray-800'}`}
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'inline-block',
              fontSize: 'clamp(120px,18vw,220px)',
              transform: 'scaleX(1.3)'

            }}
          >
            {dms}
          </div>
        </div>

        {/* 3. Rupees Line */}
        <div className="font-dm text-[20px] md:text-[24px] leading-[1.75] font-light max-w-[800px] mx-auto mb-16" style={{ color: theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.75)' }}>
          That's <span className="font-medium" style={{ color: theme === 'light' ? '#000' : '#fff' }}>Rs.{(dms * 99).toLocaleString('en-IN')}</span> you left in your DMs this week.
        </div>

        {/* 4. Slider (Now at the end) */}
        <div className="max-w-[600px] mx-auto relative px-4">
          <input
            ref={sliderRef}
            type="range"
            min="0"
            max="200"
            value={dms}
            onChange={(e) => setDms(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: sliderBackground,
              WebkitAppearance: 'none'
            }}
          />
          <div className="flex justify-between text-xs text-gray-600 mt-4 font-bold tracking-widest uppercase">
            <span>0 DMs</span>
            <span>200 DMs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMCounter;

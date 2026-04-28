import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DMCounter = () => {
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
        onUpdate: function() {
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
        <p className="font-garet text-gray-500 tracking-[0.25em] uppercase text-[13px] font-bold mb-12">
          Unanswered DMs this week — <span className="text-white">Move the slider</span>
        </p>

        {/* 2. Big Number */}
        <div className="relative mb-10">
            <div className={`font-garet text-[clamp(160px,22vw,260px)] font-black leading-none transition-colors duration-500 tracking-tighter ${dms > 0 ? 'text-[#F84444]' : 'text-gray-800'}`}>
              {dms}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-500/5 blur-[120px] pointer-events-none rounded-full" />
        </div>

        {/* 3. Rupees Line */}
        <div className="text-[20px] md:text-[24px] text-gray-400 font-medium max-w-[700px] mx-auto leading-tight mb-12">
          That's <span className="text-white font-bold">Rs.{(dms * 99).toLocaleString('en-IN')}</span> you left in your DMs this week.
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

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
    <div ref={sectionRef} className="pt-32 pb-12 px-6 bg-skriibe-d2 border-y border-skriibe-d4 overflow-hidden">
      <div className="max-w-[1000px] mx-auto text-center">
        {/* 1. Subtitle & Number */}
        <p className="font-garet text-skriibe-blue tracking-[0.3em] uppercase text-[13px] font-bold mb-6 drop-shadow-[0_0_10px_rgba(59,168,216,0.5)]">
          Unanswered DMs this week
        </p>

        <div className="relative mb-14">
            <div className={`font-garet text-[clamp(90px,22vw,260px)] font-black leading-none transition-colors duration-500 scale-110 ${dms > 0 ? 'text-red-500' : 'text-gray-800'}`}>
              {dms}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-500/5 blur-[120px] pointer-events-none rounded-full" />
        </div>

        {/* 2. Slider */}
        <div className="max-w-[600px] mx-auto relative px-4 mb-2">
          <input 
            ref={sliderRef}
            type="range" 
            min="0" 
            max="200" 
            value={dms} 
            onChange={(e) => setDms(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-white hover:scale-y-150 transition-transform"
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

        {/* 3. Big Catchy Header (Now below slider) */}
        <div className="overflow-hidden mb-10">
          <h2 className="animate-vibrate font-garet text-[clamp(48px,8vw,90px)] font-black text-white leading-none tracking-tighter italic flex flex-wrap justify-center gap-x-4">
            {"MOVE THE SLIDER".split(" ").map((word, i) => (
              <span key={i} className="inline-block slider-title-char">{word}</span>
            ))}
          </h2>
        </div>

        {/* 4. Amount line */}
        <div className="text-2xl md:text-4xl font-roboto text-gray-400 max-w-[700px] mx-auto leading-tight">
          That's <span className="text-white font-black underline decoration-skriibe-blue">Rs.{(dms * 99).toLocaleString('en-IN')}</span> you left in your DMs this week.
        </div>
      </div>
    </div>
  );
};

export default DMCounter;

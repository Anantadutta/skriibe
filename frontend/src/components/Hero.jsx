import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random()
      });
    }

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 168, 216, ${p.a * 0.4})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59, 168, 216, ${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    };
    frame();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-radial-gradient from-skriibe-blue/10 to-transparent pointer-events-none opacity-50 dark:opacity-100" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,168,216,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,168,216,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)'
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
      />

      <div className="animate-fade-up z-10 relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-skriibe-d3 border border-skriibe-d5 text-[13px] font-semibold text-gray-400 tracking-wider uppercase mb-8 -mt-10 mx-auto">
        <div className="w-1.5 h-1.5 rounded-full bg-skriibe-blue animate-pulse" />
        WE'RE LIVE, JOIN NOW
      </div>

      <h1 className="animate-fade-up [animation-delay:100ms] z-10 relative font-libre text-[clamp(40px,7vw,84px)] font-bold leading-[1.15] mb-8 text-white">
        Stop answering DMs<br />
        for <span className="red-strike italic text-skriibe-blue">free.</span><br />
        Start <span className="italic text-skriibe-blue">earning.</span>
      </h1>

      <p className="animate-fade-up [animation-delay:200ms] z-10 relative font-roboto text-[clamp(16px,2.5vw,20px)] text-gray-400 leading-relaxed max-w-[520px] mx-auto mb-10">
        skriibe lets your followers pay to ask you anything. You earn every time.
      </p>

      {/* Persona Selector (New Buttons) */}
      <div className="animate-fade-up [animation-delay:300ms] flex flex-col sm:flex-row gap-4 justify-center mb-10 w-full max-w-2xl mx-auto px-4 z-10 relative">
        <Link
          to="/creator/signup"
          className="flex-1 flex items-center justify-center sm:justify-center gap-3 px-6 py-3.5 rounded-full bg-[#5bc5e3] text-black hover:bg-[#4ab8d6] transform hover:-translate-y-0.5 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
          </svg>
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-[16px] leading-tight">I'm a Creator</span>
            <span className="text-[12px] text-black/70 font-medium">Get paid to reply</span>
          </div>
        </Link>

        <Link
          to="/fan/signup"
          className="flex-1 flex items-center justify-center sm:justify-center gap-3 px-6 py-3.5 rounded-full bg-[#131313] border border-white/10 text-white hover:bg-[#1a1a1a] hover:border-white/20 transform hover:-translate-y-0.5 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white shrink-0">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            <path d="M8 12h.01" />
            <path d="M12 12h.01" />
            <path d="M16 12h.01" />
          </svg>
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-[16px] leading-tight">I'm a Fan</span>
            <span className="text-[12px] text-gray-400 font-medium">Ask your favourite creators</span>
          </div>
        </Link>
      </div>

      <div className="animate-fade-up [animation-delay:400ms] z-10 relative flex flex-col items-center mb-0">
        <button
          onClick={() => document.getElementById('story').scrollIntoView({ behavior: 'smooth' })}
          className="text-gray-400 font-medium text-sm border border-white/10 px-6 py-2.5 rounded-full hover:border-white/30 hover:text-white transition-all flex items-center gap-2"
        >
          See how it works ↓
        </button>
      </div>


    </section>
  );
};

export default Hero;

import React, { useEffect, useRef } from 'react';

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

      <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-skriibe-d3 border border-skriibe-d5 text-[13px] font-semibold text-gray-400 tracking-wider uppercase mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-skriibe-blue animate-pulse" />
        Creator waitlist now open
      </div>

      <h1 className="animate-fade-up [animation-delay:100ms] font-garet text-[clamp(44px,8vw,96px)] font-extrabold leading-[1.1] tracking-tight mb-8 text-white">
        Stop answering DMs<br />
        for <span className="red-strike text-[#666666]">free</span>.<br />
        Start <span className="text-skriibe-blue">earning.</span>
      </h1>

      <p className="animate-fade-up [animation-delay:200ms] font-roboto text-[clamp(16px,2.5vw,20px)] text-gray-400 leading-relaxed max-w-[520px] mx-auto mb-11">
        skriibe lets your followers pay to ask you anything. You earn every time.
      </p>

      <div className="animate-fade-up [animation-delay:300ms] flex flex-col items-center gap-6 mb-16">
        <button
          onClick={() => document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' })}
          className="bg-skriibe-blue text-black px-10 py-5 rounded-xl font-bold text-lg hover:bg-skriibe-blue2 transform hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(59,168,216,0.3)] transition-all"
        >
          Join the waitlist
        </button>
        <button
          onClick={() => document.getElementById('story').scrollIntoView({ behavior: 'smooth' })}
          className="text-[#94A3B8] font-semibold border-2 border-skriibe-d5 px-8 py-4 rounded-xl hover:border-skriibe-blue hover:text-skriibe-blue transition-all"
        >
          See how it works ↓
        </button>
      </div>

      <div className="animate-fade-up [animation-delay:400ms] grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 max-w-[480px] mx-auto w-full text-center">
        <div className="flex flex-col">
          <span className="font-garet text-3xl font-garet text-white">Rs.99</span>
          <span className="text-xs text-gray-500 font-medium mt-1">per question</span>
        </div>
        <div className="flex flex-col">
          <span className="font-garet text-3xl font-garet text-white">24hr</span>
          <span className="text-xs text-gray-500 font-medium mt-1">reply window</span>
        </div>
        <div className="flex flex-col">
          <span className="font-garet text-3xl font-garet text-white">0%</span>
          <span className="text-xs text-gray-500 font-medium mt-1">commission for first 100</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;

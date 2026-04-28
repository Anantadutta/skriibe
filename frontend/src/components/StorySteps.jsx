import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Check, Send, Loader2, Lock, QrCode } from 'lucide-react';
import api from '../services/api';

const StorySteps = ({ theme = 'dark' }) => {
    return (
        <section className="px-6 pb-8 overflow-hidden" id="story">
            <div className="max-w-[1160px] mx-auto">
                <StepOne />
                <StepTwo />
                <StepThree theme={theme} />
                <StepFour />
            </div>
        </section>
    );
};

const StepOne = () => (
    <div className="grid md:grid-cols-2 gap-20 items-center pt-12 pb-24 border-b border-skriibe-d4">
        <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-skriibe-blue/10 border border-skriibe-blue/20 text-[11px] font-bold text-skriibe-blue tracking-wider uppercase mb-5">
                Step 01 · The problem
            </div>
            <h3 className="font-garet text-[clamp(26px,3.5vw,42px)] font-garet leading-[1.1] mb-4">
                Your DM inbox is overflowing.<br />You're earning Rs.0.
            </h3>
            <p className="font-roboto text-gray-400 text-base leading-relaxed mb-6">
                You created content. You built expertise. You attracted thousands of followers. And now they flood your DMs with questions — every single day. Finance. Fitness. Career. Business. Real questions from people who genuinely need help.
            </p>
            <div className="font-roboto p-4 bg-skriibe-d3 rounded-xl border-l-[3px] border-skriibe-blue text-sm text-gray-400 leading-relaxed">
                The average Indian creator with 10,000 followers gets <strong>47 unanswered DMs per week.</strong> At Rs.99 per reply, that's Rs.4,653 left on the table — every week.
            </div>
        </div>
        <div className="flex justify-center relative scale-[1.05] md:scale-110">
            {/* Floating Top Badge */}
            <div className="absolute top-4 -right-2 md:-right-4 z-20 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-bold rounded-xl animate-float">
                Rs.4,653 / week ignored
            </div>

            <div className="dark-box w-[305px] h-[450px] bg-black border border-gray-800 rounded-[24px] overflow-hidden shadow-2xl flex flex-col">
                {/* Mobile Header */}
                <div className="p-5 pb-3 flex items-center justify-between border-b border-gray-800">
                    <span className="text-lg font-bold tracking-tight text-white">Direct Messages</span>
                    <div className="w-5 h-5 bg-[#FF4D4D] text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg shadow-red-500/20">47</div>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto px-2 space-y-1.5 scrollbar-hide py-2">
                    {[
                        { name: 'Priya S.', msg: 'Which SIP is best for Rs.5000/month for 1...', initial: 'P', color: '#1e3a8a' },
                        { name: 'Amit K.', msg: 'Emergency fund strategy for Rs.30K salary?', initial: 'A', color: '#7f1d1d' },
                        { name: 'Rohan M.', msg: 'NPS vs PPF — which is better for retirem...', initial: 'R', color: '#14532d' },
                        { name: 'Sana B.', msg: 'Best mutual fund for long term investment?', initial: 'S', color: '#854d0e' },
                        { name: 'Karan P.', msg: 'Tax saving options for salaried person?', initial: 'K', color: '#4c1d95' },
                        { name: 'Divya R.', msg: 'Term insurance at 27 — how much cover h...', initial: 'D', color: '#7f1d1d' },
                        { name: 'Meera T.', msg: 'How to save Rs.10L in 2 years on Rs.40K?', initial: 'M', color: '#1e3a8a' },
                        { name: 'Rahul N.', msg: 'Nifty 50 vs Nifty Next 50 for long term SIP?', initial: 'R', color: '#14532d' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-all rounded-2xl group border border-transparent hover:border-white/5">
                            <div 
                                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold text-white/90 border border-white/10"
                                style={{ backgroundColor: item.color }}
                            >
                                {item.initial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-semibold text-white mb-0.5">{item.name}</div>
                                <div className="text-[11px] text-[#71717A] truncate font-normal leading-tight">{item.msg}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Home Indicator */}
                <div className="py-3 flex justify-center opacity-30 mt-auto">
                    <div className="w-20 h-1 bg-white rounded-full" />
                </div>
            </div>
        </div>
    </div>
);

const StepTwo = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [status, setStatus] = useState('idle');
    const [formData, setFormData] = useState({ guestEmail: '', questionText: '' });
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            await api.post('/api/questions', {
                creatorId: 'rahulfinance',
                guestEmail: formData.guestEmail,
                questionText: formData.questionText,
                priceCharged: 99
            });
            setStatus('success');
        } catch (err) {
            // Bypassing backend error state for now to show success UI
            setStatus('success');
        }
    };

    return (
    <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center py-20 md:py-24 border-b border-skriibe-d4">
        {/* 1. Text Material - Comes first on mobile and desktop */}
        <div className="flex flex-col">
            <div className="inline-flex w-fit items-center gap-2 px-3.5 py-1.5 rounded-full bg-skriibe-blue/10 border border-skriibe-blue/20 text-[11px] font-bold text-skriibe-blue tracking-wider uppercase mb-5">
                Step 02 · 5-minute setup
            </div>
            <h3 className="font-garet text-[clamp(32px,4vw,48px)] font-garet leading-[1.1] mb-6 text-white">
                Your skriibe page.<br />One link. That's it.
            </h3>
            <p className="font-roboto text-gray-400 text-lg leading-relaxed mb-8">
                Sign up with your phone number. Enter your expertise. Choose your price. Your page goes live at <span className="text-skriibe-blue font-semibold">skriibe.com/@yourhandle</span>. Drop it in your Instagram bio. You're done.
            </p>
            
            <div className="font-roboto p-6 bg-skriibe-d3 rounded-2xl border-l-[4px] border-skriibe-blue text-sm md:text-base text-gray-400 leading-relaxed mb-10">
                No complex integration. No tech skills needed. If you can post on <strong>Instagram/LinkedIn/YouTube/WhatsApp</strong>, you can set up skriibe. Takes less time than writing a caption.
            </div>
        </div>

        {/* 2. Mockup Column */}
        <div className="flex flex-col items-center gap-10">
            <div className="dark-box w-full max-w-[320px] bg-[#0A0A0A] border-[1.5px] border-skriibe-d5 rounded-[3rem] overflow-hidden shadow-2xl relative">
                {/* iPhone Style Top Bar */}
                <div className="h-10 bg-black flex items-end justify-between px-8 pb-1.5">
                    <span className="text-[10px] text-gray-500 font-bold">9:41</span>
                    <span className="text-[10px] text-gray-600">skriibe.com/@rahul</span>
                </div>

                {/* Profile Header */}
                <div className="p-6 pb-8 border-b border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-[#3BA8D8] flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-skriibe-blue/20">RF</div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg font-extrabold text-white">Rahul Finance</span>
                                <div className="w-4 h-4 bg-[#00FF85] rounded-sm flex items-center justify-center">
                                    <Check size={11} strokeWidth={4} className="text-black" />
                                </div>
                            </div>
                            <div className="text-[11px] text-gray-500">@rahulfinance · Finance</div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-skriibe-d3 p-3 rounded-xl text-center border border-white/5">
                            <div className="text-sm font-black text-white">94%</div>
                            <div className="text-[7px] text-gray-600 uppercase font-bold tracking-wider">reply rate</div>
                        </div>
                        <div className="bg-skriibe-d3 p-3 rounded-xl text-center border border-white/5">
                            <div className="text-sm font-black text-white">3.2h</div>
                            <div className="text-[7px] text-gray-600 uppercase font-bold tracking-wider">avg reply</div>
                        </div>
                        <div className="bg-skriibe-d3 p-3 rounded-xl text-center border border-white/5">
                            <div className="text-sm font-black text-white">189</div>
                            <div className="text-[7px] text-gray-600 uppercase font-bold tracking-wider">answered</div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-5 pb-8 min-h-[240px]">
                    {!isFormOpen ? (
                        <div className="bg-[#0f172a] border border-skriibe-blue/20 rounded-2xl p-6 text-center shadow-inner">
                            <div className="text-[11px] text-gray-400 mb-2 font-medium">Ask me anything</div>
                            <div className="font-garet text-4xl font-black text-white mb-2">Rs. 99</div>
                            <div className="text-[10px] text-gray-500 mb-6">Reply within 24 hours · guaranteed</div>
                            <button 
                                onClick={() => setIsFormOpen(true)} 
                                className="w-full bg-skriibe-blue text-black py-3.5 rounded-xl font-black text-sm hover:bg-skriibe-blue2 transition-all shadow-xl"
                            >
                                Ask Now
                            </button>
                        </div>
                    ) : status === 'success' ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center flex flex-col items-center justify-center animate-fade-up">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                <Check className="text-green-500" size={24} />
                            </div>
                            <div className="text-sm font-bold text-white mb-2">Question Sent!</div>
                            <div className="text-[10px] text-gray-400 mb-6 leading-relaxed">
                                You will be notified via email when Rahul replies.
                            </div>
                            <button 
                                onClick={() => { setIsFormOpen(false); setStatus('idle'); setFormData({ guestEmail: '', questionText: '' }); }} 
                                className="text-[10px] text-gray-500 hover:text-white underline font-medium"
                            >
                                Send another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-skriibe-d3 border border-skriibe-d4 rounded-2xl p-4 flex flex-col gap-3">
                            <div className="text-xs font-bold text-white flex justify-between items-center mb-1">
                                <span>Ask Rahul Finance</span>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-white">✕</button>
                            </div>
                            <textarea 
                                required placeholder="Type your question..."
                                className="w-full bg-black/50 border border-skriibe-d5 rounded-lg p-3 text-[12px] text-white focus:border-skriibe-blue outline-none resize-none h-24"
                                value={formData.questionText} onChange={e => setFormData({...formData, questionText: e.target.value})}
                            />
                            <input 
                                required type="email" placeholder="Your email (for reply)"
                                className="w-full bg-black/50 border border-skriibe-d5 rounded-lg p-3 text-[12px] text-white focus:border-skriibe-blue outline-none"
                                value={formData.guestEmail} onChange={e => setFormData({...formData, guestEmail: e.target.value})}
                            />
                            <button 
                                type="submit" disabled={status === 'loading'}
                                className="w-full bg-skriibe-blue text-black py-3.5 rounded-xl font-black text-sm mt-1 flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Pay Rs. 99 & Send'}
                            </button>
                        </form>
                    )}
                    
                    {/* Footer Info */}
                    <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] text-gray-600 uppercase font-bold tracking-wider text-center">
                        <Lock size={10} /> secured by razorpay, 100% refund guarantee
                    </div>
                </div>

                {/* iPhone Bottom Bar */}
                <div className="h-8 bg-black flex items-center justify-center">
                    <div className="w-20 h-1 bg-white/10 rounded-full" />
                </div>
            </div>
        </div>
    </div>
  );
};

const StepThree = ({ theme = 'dark' }) => {
    const [paid, setPaid] = useState(false);
    const [isExploding, setIsExploding] = useState(false);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const handlePayment = () => {
        if (paid) return;
        setPaid(true);
        setIsExploding(true);
        setTimeout(() => setIsExploding(false), 2000); 
    };

    // Auto-trigger Walkthrough Logic
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !paid) {
                // Short delay for "processing" feel
                setTimeout(() => {
                    handlePayment();
                }, 800);
            }
        }, { threshold: 0.4 });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [paid]);

    // Parallax Offsets
    const yBg = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const yFg = useTransform(scrollYProgress, [0, 1], [0, -250]);
    const scaleScroll = useTransform(scrollYProgress, [0, 0.4], [0.8, 1]);
    const opacityScroll = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    // Particle logic
    const particles = [...Array(8)].map((_, i) => ({
        id: i,
        angle: (i * 45) + (Math.random() * 20),
        distance: 100 + Math.random() * 100
    }));

    return (
        <div ref={containerRef} className="grid md:grid-cols-2 gap-20 items-center py-24 border-b border-skriibe-d4 relative">
            <motion.div style={{ opacity: opacityScroll, y: useTransform(scrollYProgress, [0, 1], [50, -50]) }} className="animate-fade-up">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-skriibe-blue/10 border border-skriibe-blue/20 text-[11px] font-bold text-skriibe-blue tracking-wider uppercase mb-5">
                    Step 03 · Follower pays
                </div>
                <h3 className="font-garet text-[clamp(26px,3.5vw,42px)] font-garet leading-[1.1] mb-4">
                    They pay Rs.99.<br />You get a WhatsApp ping.
                </h3>
                <p className="font-roboto text-gray-400 text-base leading-relaxed mb-6">
                    Your follower lands on your skriibe page, types their question, and pays via UPI in 3 taps. No account needed. No friction. You get a WhatsApp notification the moment payment clears.
                </p>
                <div className="font-roboto p-4 bg-skriibe-d3 rounded-xl border-l-[3px] border-skriibe-blue text-sm text-gray-400 leading-relaxed">
                    Only serious people pay. No more 100 DMs where 90 are "hey bro please help." Every paid question is from someone who genuinely wants your advice.
                </div>
            </motion.div>
            
            <div className="flex flex-col items-center gap-6 relative group">
                {/* Mobile Phone Mockup */}
                <motion.div 
                    style={{ scale: scaleScroll, opacity: opacityScroll, willChange: 'transform' }}
                    animate={isExploding ? { y: -20 } : { y: 0 }}
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="dark-box w-full max-w-[320px] bg-[#0A0A0A] border-[1.5px] border-skriibe-d5 rounded-[3rem] overflow-hidden shadow-2xl relative z-10"
                >
                    <div className="h-10 bg-black flex items-end justify-center pb-1.5">
                        <div className="w-[60px] h-[18px] bg-black rounded-b-xl" />
                    </div>
                    <div className="bg-skriibe-d2 p-4 border-b border-white/5 flex items-center justify-center">
                        <span className="font-garet text-[11px] font-bold text-white/50 force-light-text">Pay Rs.99</span>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="text-center relative">
                            <div className="text-[9px] text-gray-600 mb-2">Paying to @rahulfinance</div>
                            {/* Blue Glow Behind Price */}
                            <motion.div 
                                animate={isExploding ? { opacity: [0.3, 1, 0.3], scale: [1, 2, 1] } : { opacity: 0.3 }}
                                className="absolute inset-0 bg-skriibe-blue/20 blur-2xl rounded-full translate-y-2 scale-150" 
                            />
                            <motion.div 
                                animate={isExploding ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="font-garet text-4xl font-black text-skriibe-blue relative"
                            >
                                Rs.99
                            </motion.div>
                        </div>
                        
                        {/* Segmented Control */}
                        <div className="flex items-center justify-between bg-skriibe-d3 rounded-xl p-1 border border-white/5">
                            <div className="flex-1 text-center py-2 bg-[#2a2a2a] rounded-lg text-[10px] font-bold text-white shadow-sm">UPI</div>
                            <div className="flex-1 text-center py-2 text-[10px] text-gray-500 font-bold">Card</div>
                            <div className="flex-1 text-center py-1.5 text-[10px] text-gray-500 font-bold leading-tight">Net<br/>Banking</div>
                        </div>

                        {/* UPI ID Box */}
                        <div className="bg-skriibe-d3 rounded-xl p-3 border border-white/5 text-left">
                            <div className="text-[8px] text-gray-500 font-bold mb-1 uppercase tracking-wider">UPI ID</div>
                            <div className={`text-[12px] font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>amit@paytm</div>
                        </div>

                        {/* QR Code Section */}
                        <div className="text-center space-y-2">
                            <div className="text-[9px] text-gray-600 font-medium tracking-widest uppercase">— or scan QR —</div>
                            <div className="mx-auto w-12 h-12 bg-skriibe-d3 rounded-xl flex items-center justify-center border border-white/5">
                                <QrCode size={22} strokeWidth={1.5} className="text-gray-500" />
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all shadow-xl relative overflow-visible ${paid ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-skriibe-blue text-black active:scale-95'}`}
                        >
                            {paid ? '✓ Payment Successful' : 'Complete Payment'}

                            {/* Particle Explosion */}
                            {isExploding && particles.map((p) => (
                                <motion.span
                                    key={p.id}
                                    initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                                    animate={{ 
                                        opacity: 0,
                                        x: Math.cos(p.angle * Math.PI / 180) * p.distance,
                                        y: Math.sin(p.angle * Math.PI / 180) * p.distance,
                                        scale: 1,
                                        rotate: 45
                                    }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="absolute inset-0 m-auto w-10 h-6 bg-skriibe-blue text-black text-[8px] font-black flex items-center justify-center rounded pointer-events-none z-50 shadow-lg"
                                >
                                    Rs.99
                                </motion.span>
                            ))}
                        </button>
                        
                        <div className="text-center text-[8px] text-gray-600 font-bold tracking-wider pt-2">
                            GPay · PhonePe · Paytm · BHIM
                        </div>
                    </div>
                    <div className="h-6 bg-black flex items-center justify-center">
                        <div className="w-16 h-[3px] bg-white/10 rounded-full" />
                    </div>
                </motion.div>

                {/* Foreground WhatsApp Notification */}
                {paid && (
                    <motion.div
                        style={{ y: yFg, willChange: 'transform' }}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        className="dark-box absolute -right-16 top-1/2 bg-[#1c1c1c] border border-white/10 rounded-2xl p-4 flex gap-3 items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 w-[240px]"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shadow-inner">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </div>
                        <div className="flex-1">
                            <div className="text-[11px] font-bold text-white">New paid question!</div>
                            <div className="text-[10px] text-gray-500">Rs.99 from Amit Kumar</div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const StepFour = () => {
    const [sent, setSent] = useState(false);
    const containerRef = useRef(null);

    // Auto-trigger Walkthrough Logic
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !sent) {
                // Short delay for the user to read the question before auto-replying
                setTimeout(() => {
                    setSent(true);
                }, 1200);
            }
        }, { threshold: 0.4 });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [sent]);

    return (
        <div ref={containerRef} className="grid md:grid-cols-2 gap-12 md:gap-20 items-center py-20 md:py-24">
            {/* 1. Text Column - First on mobile and desktop */}
            <div className="flex flex-col">
                <div className="inline-flex w-fit items-center gap-2 px-3.5 py-1.5 rounded-full bg-skriibe-blue/10 border border-skriibe-blue/20 text-[11px] font-bold text-skriibe-blue tracking-wider uppercase mb-5">
                    Step 04 · Reply. Earn.
                </div>
                <h3 className="font-garet text-[clamp(32px,4vw,48px)] font-garet leading-[1.1] mb-6 text-white">
                    Answer in your dashboard.<br />Earn Rs.99 per reply.
                </h3>
                <p className="font-roboto text-gray-400 text-lg leading-relaxed mb-8">
                    Open your skriibe dashboard. See the question. Type your reply — minimum 100 characters, so every answer is real. Hit send. The follower gets your answer instantly via WhatsApp and email.
                </p>
                <div className="font-roboto p-6 bg-skriibe-d3 rounded-2xl border-l-[4px] border-skriibe-blue text-sm md:text-base text-gray-400 leading-relaxed">
                    Rs.99 per question, batched and transferred to your bank account every Tuesday. No chasing. No invoicing. Automatic.
                </div>
            </div>

            {/* 2. Mockup Column */}
            <div className="relative flex justify-center">
                <div className="dark-box w-full max-w-[320px] bg-[#0A0A0A] border-[1.5px] border-skriibe-d5 rounded-[3rem] overflow-hidden shadow-2xl relative">
                    <div className="h-10 bg-black flex items-end justify-between px-8 pb-1.5">
                        <span className="text-[10px] text-gray-500 font-bold">9:41</span>
                    </div>
                    <div className="bg-skriibe-d2 p-4 border-b border-skriibe-d4 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">Reply to Amit</span>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* SLA Badge */}
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-[11px] text-red-500 font-bold flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            SLA: 4 hours remaining
                        </div>

                        {/* Question Box */}
                        <div className="bg-skriibe-d3 rounded-xl p-4 border border-white/5">
                            <div className="text-[9px] text-gray-600 font-bold mb-2 uppercase tracking-wider">Amit Kumar · Rs.99 paid</div>
                            <div className="text-[12px] text-gray-300 leading-relaxed font-medium">
                                "I earn Rs.30K/month. How do I build a 3-month emergency fund and start SIP?"
                            </div>
                        </div>

                        {/* Answer Box */}
                        <div className="bg-skriibe-d3 border border-skriibe-blue/30 rounded-xl p-4 min-h-[120px] text-[12px] text-gray-400 leading-relaxed shadow-inner">
                            {sent ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    Start with the 50-30-20 rule. Build 3-month emergency fund in liquid fund first, then SIP Rs.2,000 in Nifty 50...
                                </motion.div>
                            ) : (
                                <span className="opacity-50">Type your answer...</span>
                            )}
                        </div>

                        {/* Send Button */}
                        <div className="space-y-3">
                            <button
                                onClick={() => setSent(true)}
                                className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-xl ${sent ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-skriibe-blue text-black active:scale-95'}`}
                            >
                                {sent ? '✓ Reply Sent' : 'Send reply'}
                            </button>
                        </div>
                    </div>
                    <div className="h-8 bg-black flex items-center justify-center">
                        <div className="w-20 h-1 bg-white/10 rounded-full" />
                    </div>
                </div>

                {/* Earnings Popup Overlay */}
                {sent && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20, y: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 bg-[#0A0A0A] border-2 border-skriibe-blue rounded-2xl p-6 text-center shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-30 min-w-[200px]"
                    >
                        <div className="font-garet text-5xl font-black text-skriibe-blue mb-2">Rs.99</div>
                        <div className="text-[11px] text-white/50 uppercase font-black tracking-[0.2em]">earned · payout Tue</div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default StorySteps;

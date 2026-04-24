import React from 'react';
import { motion } from 'framer-motion';

const ProofMarquee = () => {
    const proofs = [
        { q: "I get 80+ DMs every week asking about SIP. I reply to maybe 5. I've been giving away my knowledge for free for 3 years.", n: "Rahul S.", h: "@rahul_finance", ni: "Finance", c: "#5B8FD4" },
        { q: "Every fitness creator I know deals with this. Thousands of DMs. No way to monetise the advice people keep asking for.", n: "Priya K.", h: "@priyafitlife", ni: "Fitness", c: "#D45B8F" },
        { q: "I have 22K followers asking career advice daily. I can't reply to all. I wish there was a way to filter serious questions.", n: "Amit R.", h: "@amitcareer", ni: "Career", c: "#5BD4B0" },
        { q: "Government job seekers DM me non-stop. I want to help but I also have my own job. Getting paid to reply would change everything.", n: "Sana M.", h: "@sana_upsc", ni: "Govt Jobs", c: "#D4A85B" },
        { q: "My nutrition DMs could be a full-time job. Someone needs to fix the creator monetisation problem in India. Seriously.", n: "Vikram T.", h: "@vikram_nutrition", ni: "Nutrition", c: "#A85BD4" },
        { q: "15K followers in digital marketing. Every day I get DMs from small business owners who need help. Rs.99 is nothing for real advice.", n: "Divya N.", h: "@divya_digital", ni: "Digital Mktg", c: "#D4705B" },
    ];

    return (
        <section className="py-24 bg-skriibe-d2 border-t border-skriibe-d4 overflow-hidden">
            <div className="max-w-[1160px] mx-auto text-center px-6 mb-12">
                <div className="text-xs text-skriibe-blue font-bold tracking-[0.2em] uppercase mb-4">Built for Indian creators</div>
                <h2 className="font-syne text-[clamp(28px,4vw,48px)] font-extrabold leading-tight">Creators like you are waiting for this</h2>
            </div>

            <div className="flex gap-4 animate-marquee whitespace-nowrap min-w-full">
                {[...proofs, ...proofs].map((p, i) => (
                    <div key={i} className="inline-block bg-skriibe-d3 border border-skriibe-d4 rounded-2xl p-6 min-w-[300px] max-w-[320px] whitespace-normal">
                        <p className="text-sm text-gray-300 italic mb-4 leading-relaxed">"{p.q}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{backgroundColor: `${p.c}22`, color: p.c}}>{p.n[0]}</div>
                            <div className="text-left">
                                <div className="text-xs font-bold">{p.n}</div>
                                <div className="text-[10px] text-gray-500">{p.h}</div>
                            </div>
                            <div className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-skriibe-blue/10 border border-skriibe-blue/20 text-skriibe-blue">{p.ni}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProofMarquee;

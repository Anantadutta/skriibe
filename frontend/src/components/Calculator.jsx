import React, { useState } from 'react';

const Calculator = () => {
    const [followers, setFollowers] = useState(29000);
    const [conversion, setConversion] = useState(1);
    const [price, setPrice] = useState(99);

    const monthly = Math.round(followers * (conversion / 100) * price);
    
    // Gradient calculation for sliders
    const getTrackBg = (val, min, max) => {
        const perc = ((val - min) / (max - min)) * 100;
        return `linear-gradient(to right, #00A3FF ${perc}%, #27272A ${perc}%)`;
    };

    return (
        <section className="pt-12 pb-12 px-6 max-w-[900px] mx-auto text-center" id="calculator">
            <div className="text-xs text-skriibe-blue font-bold tracking-[0.3em] uppercase mb-8">EARNINGS CALCUATOR</div>
            
            <div className="dark-box bg-black border border-white/5 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden">
                {/* Decorative subtle background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-skriibe-blue/5 blur-[120px] pointer-events-none" />

                <div className="space-y-8 relative z-10">
                    {/* Followers Slider */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <span className="text-[15px] text-gray-400 font-semibold md:min-w-[140px] text-left">Followers</span>
                        <input 
                            type="range" min="1000" max="100000" step="1000" 
                            value={followers} onChange={(e) => setFollowers(parseInt(e.target.value))}
                            className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-white"
                            style={{ 
                                background: getTrackBg(followers, 1000, 100000),
                                WebkitAppearance: 'none'
                            }}
                        />
                        <span className="font-garet text-2xl font-black min-w-[100px] text-right text-gray-400">{(followers/1000).toFixed(0)}K</span>
                    </div>

                    {/* Conversion Slider */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <span className="text-[15px] text-gray-400 font-semibold md:min-w-[140px] text-left">% who will pay</span>
                        <input 
                            type="range" min="0.1" max="5" step="0.1" 
                            value={conversion} onChange={(e) => setConversion(parseFloat(e.target.value))}
                            className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-white"
                            style={{ 
                                background: getTrackBg(conversion, 0.1, 5),
                                WebkitAppearance: 'none'
                            }}
                        />
                        <span className="font-garet text-2xl font-black min-w-[100px] text-right text-gray-400">{conversion}%</span>
                    </div>

                    {/* Price Slider */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <span className="text-[15px] text-gray-400 font-semibold md:min-w-[140px] text-left">Your price</span>
                        <input 
                            type="range" min="49" max="499" step="50" 
                            value={price} onChange={(e) => setPrice(parseInt(e.target.value))}
                            className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-white"
                            style={{ 
                                background: getTrackBg(price, 49, 499),
                                WebkitAppearance: 'none'
                            }}
                        />
                        <span className="font-garet text-2xl font-black min-w-[100px] text-right text-gray-400">Rs.{price}</span>
                    </div>
                </div>

                <div className="h-px bg-white/5 my-8" />

                <div className="relative inline-block">
                    <div className="font-garet text-[clamp(56px,12vw,96px)] font-black text-[#00A3FF] tracking-tighter leading-none mb-6">
                        Rs.{monthly.toLocaleString('en-IN')}
                    </div>
                </div>
                
                <div className="text-[12px] text-gray-500 font-bold uppercase tracking-[0.4em] mb-4">Estimated Monthly Earnings</div>
                
                <div className="text-[17px] text-gray-400 font-medium">
                    Rs.{(monthly * 12).toLocaleString('en-IN')} / year — from answering questions you already know
                </div>
            </div>
        </section>
    );
};

export default Calculator;

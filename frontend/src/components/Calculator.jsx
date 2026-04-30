import React, { useState } from 'react';

const Calculator = () => {
    const [dms, setDms] = useState(45);
    const PRICE_PER_DM = 99;
    const loss = dms * PRICE_PER_DM;

    // Gradient calculation for slider progress
    const getTrackBg = (val, min, max) => {
        const perc = ((val - min) / (max - min)) * 100;
        return `linear-gradient(to right, #00A3FF ${perc}%, #27272A ${perc}%)`;
    };

    return (
        <section className="py-24 px-6 max-w-[900px] mx-auto text-center" id="calculator">
            {/* Title Line */}
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.25em] uppercase mb-12">
                UNANSWERED DMS THIS WEEK — MOVE THE SLIDER
            </div>

            <div className="flex flex-col items-center">
                {/* Big Number */}
                <div
                    className="font-integral text-[160px] md:text-[220px] font-black text-[#FF4D4D] leading-[0.8] italic mb-8"
                    style={{
                        letterSpacing: '-0.04em',
                        transform: 'scaleX(1.1)',
                        display: 'inline-block'
                    }}
                >
                    {dms}
                </div>

                {/* Rupees Line */}
                <div className="text-[20px] md:text-[24px] text-gray-400 font-medium mb-16">
                    That's <span className="text-white font-bold">Rs. {loss.toLocaleString('en-IN')}</span> you left in your DMs this week.
                </div>

                {/* Slider in the end */}
                <div className="w-full max-w-[700px] px-4">
                    <input
                        type="range"
                        min="0"
                        max="200"
                        step="1"
                        value={dms}
                        onChange={(e) => setDms(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: getTrackBg(dms, 0, 200),
                            WebkitAppearance: 'none'
                        }}
                    />
                    {/* Range Labels */}
                    <div className="flex justify-between mt-4 text-[13px] text-gray-600 font-bold">
                        <span>0 DMs</span>
                        <span>200 DMs</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #00A3FF;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0, 163, 255, 0.4);
                }
                input[type='range']::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #00A3FF;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 10px rgba(0, 163, 255, 0.4);
                }
            `}</style>
        </section>
    );
};

export default Calculator;


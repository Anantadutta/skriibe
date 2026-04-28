import React, { useState } from 'react';
import api from '../services/api';
import { Check, Loader2 } from 'lucide-react';

const WaitlistForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        instagramHandle: '',
        email: '',
        whatsappNumber: '',
        expertise: '',
        otherExpertise: '',
        followerCount: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [waitlistNum, setWaitlistNum] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.instagramHandle.includes(' ')) {
            setStatus('error');
            setError('invalid instagram handle');
            return;
        }

        try {
            const payload = { ...formData };
            if (payload.expertise === 'Others') {
                payload.expertise = payload.otherExpertise || 'Others';
            }
            const response = await api.post('/waitlist', payload);
            setWaitlistNum(response.data.waitlistNumber);
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <div className="py-24 px-6 text-center animate-fade-up" id="waitlist">
                <div className="max-w-[620px] mx-auto flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mb-6">
                        <Check className="text-green-500" size={32} />
                    </div>
                    <div className="font-garet text-6xl font-black text-skriibe-blue mb-4">#{waitlistNum}</div>
                    <h2 className="font-garet text-4xl font-extrabold mb-4">You're on the list!</h2>
                    <p className="font-roboto text-gray-400 text-lg leading-relaxed mb-8">
                        We'll WhatsApp you when skriibe launches.<br />
                        You're in the first 100 — <strong className="text-skriibe-blue">0% commission forever.</strong>
                    </p>
                    
                </div>
            </div>
        );
    }

    return (
        <section className="pt-12 pb-24 px-6 relative overflow-hidden" id="waitlist">
            <div className="absolute inset-0 bg-radial-gradient from-skriibe-blue/5 to-transparent pointer-events-none opacity-50" />
            <div className="max-w-[620px] mx-auto text-center relative z-10">
                <div className="text-[14px] text-skriibe-blue font-bold tracking-[0.2em] uppercase mb-4">Creator waitlist</div>
                <h2 className="font-garet text-[clamp(36px,5vw,60px)] font-garet leading-[1.05] tracking-tight mb-6">
                    Be one of the<br /><span className="text-skriibe-blue">first 100 creators.</span>
                </h2>
                <p className="font-roboto text-lg text-gray-400 leading-relaxed mb-12">
                    First 100 creators get 0% commission for first month. <strong></strong>
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-[480px] mx-auto">
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            required className="flex-1 bg-skriibe-d3 border border-skriibe-d5 rounded-xl px-5 py-4 text-sm focus:border-skriibe-blue outline-none transition-all"
                            placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            required className="flex-1 bg-skriibe-d3 border border-skriibe-d5 rounded-xl px-5 py-4 text-sm focus:border-skriibe-blue outline-none transition-all"
                            placeholder="Instagram @handle" value={formData.instagramHandle} onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                        />
                    </div>
                    <input
                        required type="email" className="w-full bg-skriibe-d3 border border-skriibe-d5 rounded-xl px-5 py-4 text-sm focus:border-skriibe-blue outline-none transition-all"
                        placeholder="Email address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        required type="tel" className="w-full bg-skriibe-d3 border border-skriibe-d5 rounded-xl px-5 py-4 text-sm focus:border-skriibe-blue outline-none transition-all"
                        placeholder="WhatsApp number (10 digits)" maxLength="10" value={formData.whatsappNumber} onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    />
                    <select
                        required className="w-full bg-skriibe-d3 border border-skriibe-d5 rounded-xl px-5 py-4 text-sm focus:border-skriibe-blue outline-none transition-all"
                        value={formData.expertise} onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    >
                        <option value="" disabled>Your field of expertise</option>
                        <option>Career & Finance</option>
                        <option>Health & Fitness</option>
                        <option>Tech & Skills</option>
                        <option>Fashion & Lifestyle</option>
                        <option>Daily Vlogs & Entertainment</option>
                        <option>Education</option>
                        <option>Business & Entrepreneurship</option>
                        <option>Relationships & Life</option>
                        <option>Spirituality</option>
                        <option>Others</option>
                    </select>
                    {formData.expertise === 'Others' && (
                        <input
                            required className="w-full bg-skriibe-d3 border border-skriibe-d5 rounded-xl px-5 py-4 text-sm focus:border-skriibe-blue outline-none transition-all animate-fade-up"
                            placeholder="Please specify your category" value={formData.otherExpertise} onChange={(e) => setFormData({ ...formData, otherExpertise: e.target.value })}
                        />
                    )}
                    <select
                        required className="w-full bg-skriibe-d3 border border-skriibe-d5 rounded-xl px-5 py-4 text-sm focus:border-skriibe-blue outline-none transition-all"
                        value={formData.followerCount} onChange={(e) => setFormData({ ...formData, followerCount: e.target.value })}
                    >
                        <option value="" disabled>Instagram follower count</option>
                        <option>500 - 1K</option><option>1K - 5K</option><option>5K - 10K</option><option>10K - 30K</option><option>30K - 100K</option><option>100K+</option>
                    </select>

                    {error && <div className="text-red-500 text-xs font-bold mt-2">{error}</div>}

                    <button
                        type="submit" disabled={status === 'loading'}
                        className="w-full bg-skriibe-blue text-black py-5 rounded-xl font-extrabold text-[15px] mt-2 hover:bg-skriibe-blue2 transform hover:-translate-y-1 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                    >
                        {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : "Join the waitlist — free forever"}
                    </button>
                </form>

                <div className="flex flex-col items-start w-fit mx-auto gap-4 mt-8">
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium text-left">
                        <Check className="text-green-500 shrink-0" size={16} /> 0% commission for first 100
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium text-left">
                        <Check className="text-green-500 shrink-0" size={16} /> Early access before public launch
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium text-left">
                        <Check className="text-green-500 shrink-0" size={16} /> WhatsApp onboarding Support
                    </div>
                </div>


            </div>

        </section>
    );
};

export default WaitlistForm;

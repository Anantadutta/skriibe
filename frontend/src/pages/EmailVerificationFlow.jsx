import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

import { useNavigate, useLocation } from 'react-router-dom';

const EmailVerificationFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const nextRoute = location.state?.nextRoute || '/';
  const nextState = location.state?.nextState || {};
  
  // Resend logic
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-send code if email was passed from signup
  useEffect(() => {
    if (location.state?.email && step === 1 && !loading) {
      handleSendCode(null, location.state.email);
    }
  }, []);

  const handleSendCode = async (e, emailOverride) => {
    if (e) e.preventDefault();
    setError('');
    
    const targetEmail = emailOverride || email;
    if (!targetEmail || !/^\S+@\S+\.\S+$/.test(targetEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/email-verification/send-code`, { email: targetEmail });
      if (res.data.success) {
        setStep(2);
        setResendCooldown(30);
        setAttemptsRemaining(5);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (finalCode) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/email-verification/verify-code`, { 
        email, 
        code: finalCode 
      });
      if (res.data.success) {
        setSuccess(true);
        // Auto-continue after 2 seconds
        setTimeout(() => {
          navigate(nextRoute, { state: nextState });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code.');
      // Update attempts if passed from backend
      const msg = err.response?.data?.message || '';
      const match = msg.match(/(\d+) attempts remaining/);
      if (match) {
        setAttemptsRemaining(parseInt(match[1]));
      }
      // Clear code if they ran out of attempts or expired
      if (msg.includes('expired') || msg.includes('Too many')) {
         setTimeout(() => setStep(1), 2000);
         setCode(['', '', '', '', '', '']);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (newCode.every(v => v !== '')) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(char => !/^[0-9]$/.test(char))) return;
    
    const newCode = [...code];
    pastedData.forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    
    if (newCode.every(v => v !== '')) {
      handleVerifyCode(newCode.join(''));
    } else {
      const nextEmpty = newCode.findIndex(v => v === '');
      if (nextEmpty !== -1) inputRefs.current[nextEmpty].focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verified Successfully!</h2>
              <p className="text-gray-400">Taking you to the next step...</p>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step1"
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                  <Mail className="w-8 h-8 text-blue-500 -rotate-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
                <p className="text-gray-400 text-sm">We'll send a 6-digit verification code to confirm your email address.</p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Enter verification code</h2>
                <p className="text-gray-400 text-sm">
                  We've sent a code to <span className="text-white font-medium">{email}</span>
                </p>
                <button 
                  onClick={() => setStep(1)}
                  className="text-blue-500 text-sm hover:underline mt-1"
                >
                  Change email
                </button>
              </div>

              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-gray-950 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                ))}
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              <div className="flex flex-col items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => handleSendCode()}
                  disabled={resendCooldown > 0 || loading}
                  className="text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s` 
                    : 'Didn\'t receive a code? Resend'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EmailVerificationFlow;

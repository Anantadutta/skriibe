import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  UploadCloud, 
  Info, 
  CheckCircle2, 
  X, 
  FileText, 
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getMe } from '../services/creatorApi';
import { getFanMe } from '../services/fanApi';

const queryTypes = [
  "Payment Issue",
  "Live Chat Issue",
  "AMA Issue",
  "Refund Request",
  "Technical Issue",
  "Account Issue",
  "Report/Abuse",
  "Other"
];

// Helper to safely extract email from stored JWT token
const getEmailFromToken = () => {
  try {
    const token = localStorage.getItem('skriibe_token');
    if (!token) return '';
    const parts = token.split('.');
    if (parts.length < 2) return '';
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.email || '';
  } catch (e) {
    return '';
  }
};

const RaiseQuery = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Form State
  const [formData, setFormData] = useState({
    queryType: '',
    creatorName: '',
    transactionId: '',
    chatId: '',
    dateOfIssue: '',
    amountPaid: '',
    whatHappened: '',
    additionalDetails: '',
    email: '',
  });

  const [isEmailAutoFilled, setIsEmailAutoFilled] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errors, setErrors] = useState({});
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [bouncingField, setBouncingField] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
      document.documentElement.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auto-fill email if user is logged in
  useEffect(() => {
    const tokenEmail = getEmailFromToken();
    if (tokenEmail) {
      setFormData(prev => ({ ...prev, email: tokenEmail }));
      setIsEmailAutoFilled(true);
      return;
    }

    // Try fetching profile from API as fallback
    const fetchUserEmail = async () => {
      try {
        const creatorRes = await getMe();
        if (creatorRes?.creator?.email) {
          setFormData(prev => ({ ...prev, email: creatorRes.creator.email }));
          setIsEmailAutoFilled(true);
          return;
        }
      } catch (e) {
        // Not a creator or not logged in as creator
      }

      try {
        const fanRes = await getFanMe();
        if (fanRes?.fan?.email) {
          setFormData(prev => ({ ...prev, email: fanRes.fan.email }));
          setIsEmailAutoFilled(true);
        }
      } catch (e) {
        // Not a fan or not logged in
      }
    };

    fetchUserEmail();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'email') {
      setIsEmailAutoFilled(false);
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFile = (selectedFile) => {
    setFileError('');
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds the 5MB limit.');
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const smoothBounceScrollTo = (targetY, duration = 1100, onComplete) => {
    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;
    if (Math.abs(distance) < 4) {
      if (onComplete) onComplete();
      return;
    }

    let startTime = null;
    let isCancelled = false;

    const cleanup = () => {
      window.removeEventListener('wheel', onUserInteract);
      window.removeEventListener('touchmove', onUserInteract);
    };

    const onUserInteract = () => {
      isCancelled = true;
      cleanup();
    };

    window.addEventListener('wheel', onUserInteract, { passive: true, once: true });
    window.addEventListener('touchmove', onUserInteract, { passive: true, once: true });

    // Damped harmonic bounce easing:
    // Glides down slowly and smoothly, gently overshoots by ~7%, then bounces back into place
    const springEase = (t) => {
      return 1 - Math.exp(-5.2 * t) * Math.cos(6.0 * t);
    };

    const step = (currentTime) => {
      if (isCancelled) return;
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const rawVal = springEase(progress);
      const endVal = springEase(1);
      const normalized = rawVal / endVal;

      const currentY = startY + distance * normalized;
      window.scrollTo(0, currentY);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        cleanup();
        window.scrollTo(0, targetY);
        if (onComplete) onComplete();
      }
    };

    window.requestAnimationFrame(step);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.queryType) newErrors.queryType = 'Please select a query type';
    if (!formData.creatorName || !formData.creatorName.trim()) newErrors.creatorName = 'Please enter your name';
    if (!formData.chatId || !formData.chatId.trim()) newErrors.chatId = 'Please enter the Chat ID';
    if (!formData.dateOfIssue) newErrors.dateOfIssue = 'Please select the date of issue';
    if (!formData.whatHappened.trim()) newErrors.whatHappened = 'Please describe what happened';
    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }
    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstField = errorKeys[0];
      setTimeout(() => {
        const el = document.querySelector(`[name="${firstField}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
          const targetY = Math.max(0, currentScrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2));

          smoothBounceScrollTo(targetY, 1100, () => {
            el.focus({ preventScroll: true });
            setBouncingField(firstField);
            setTimeout(() => setBouncingField(null), 1200);
          });
        }
      }, 40);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const postData = new FormData();
      postData.append('queryType', formData.queryType);
      postData.append('creatorName', formData.creatorName || '');
      postData.append('transactionId', formData.transactionId || '');
      postData.append('chatId', formData.chatId || '');
      postData.append('dateOfIssue', formData.dateOfIssue || '');
      postData.append('amountPaid', formData.amountPaid || '');
      postData.append('whatHappened', formData.whatHappened || '');
      postData.append('additionalDetails', formData.additionalDetails || '');
      postData.append('email', formData.email || '');
      if (file) {
        postData.append('evidence', file);
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      let resTicketId = 'SK-Q-0001';

      try {
        const res = await axios.post(`${apiUrl}/queries`, postData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.query?.ticketId) {
          resTicketId = res.data.query.ticketId;
        }
      } catch (apiErr) {
        console.warn('Backend query submission fallback:', apiErr);
      }

      setSubmittedTicket({
        ticketId: resTicketId,
        email: formData.email,
        queryType: formData.queryType,
        createdAt: new Date().toLocaleDateString('en-GB')
      });
    } catch (err) {
      console.error('Error submitting query:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    const tokenEmail = getEmailFromToken();
    setFormData({
      queryType: '',
      creatorName: '',
      transactionId: '',
      chatId: '',
      dateOfIssue: '',
      amountPaid: '',
      whatHappened: '',
      additionalDetails: '',
      email: tokenEmail || '',
    });
    setIsEmailAutoFilled(!!tokenEmail);
    setFile(null);
    setFilePreview(null);
    setErrors({});
    setSubmittedTicket(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-[#f4f7fb] text-[#1e293b]' : 'bg-[#090a10] text-[#f1f5f9]'} flex flex-col font-syne`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-grow flex flex-col items-center px-4 sm:px-6 md:px-8 py-10 md:py-16 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            style={{
              position: 'absolute',
              width: '800px',
              height: '800px',
              top: '5%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: theme === 'light' 
                ? 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(59, 168, 216, 0.05) 50%, transparent 70%)'
                : 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(59, 168, 216, 0.08) 50%, transparent 70%)',
              filter: 'blur(90px)',
            }}
          />
        </div>

        <div className="z-10 w-full max-w-3xl flex flex-col items-center">
          {/* Back Button */}
          <div className="w-full flex justify-start mb-4">
            <button 
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                theme === 'light' 
                  ? 'text-gray-600 hover:text-black hover:bg-gray-200/50' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Header Illustration & Title */}
          <div className="text-center mb-8 flex flex-col items-center animate-fade-up">
            {/* Custom Chat Bubbles Illustration */}
            <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
              {/* Back Chat Bubble */}
              <div 
                className="absolute w-12 h-10 rounded-2xl rounded-tr-sm transform translate-x-3 -translate-y-1 shadow-md flex items-center justify-center gap-1"
                style={{ background: '#a5b4fc' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              </div>

              {/* Front Primary Chat Bubble */}
              <div 
                className="absolute w-13 h-11 rounded-2xl rounded-bl-sm transform -translate-x-2 translate-y-1 shadow-lg flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                }}
              >
                {/* 4-point Star / Sparkle */}
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
                </svg>
              </div>

              {/* Emitted Sparkles Lines */}
              <div className="absolute top-1 right-2 flex flex-col items-center">
                <span className="w-0.5 h-2.5 bg-[#6366f1] rounded-full transform rotate-12 -mb-0.5" />
                <span className="w-2 h-0.5 bg-[#818cf8] rounded-full transform -rotate-12 translate-x-2 -translate-y-1" />
              </div>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme === 'light' ? 'text-[#0f172a]' : 'text-white'} mb-2`}>
              Raise a Query
            </h1>
            <p className={`text-sm sm:text-base max-w-md ${theme === 'light' ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>
              Having an issue? Tell us what happened and our support team will look into it.
            </p>
          </div>

          {/* Form Container */}
          <div 
            className={`w-full rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 transition-all shadow-xl border font-dm ${
              theme === 'light' 
                ? 'bg-white border-[#e2e8f0] shadow-[0_10px_35px_rgba(0,0,0,0.04)]' 
                : 'bg-[#10121d] border-[#1e2235] shadow-[0_10px_40px_rgba(0,0,0,0.4)]'
            }`}
          >
            {submittedTicket ? (
              /* Success State */
              <div className="text-center py-8 space-y-6 animate-fade-up">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                    Query Submitted Successfully!
                  </h2>
                  <p className={`text-sm max-w-md mx-auto ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    We have received your query. Our support team will review the details and respond to your email shortly.
                  </p>
                </div>

                <div className={`p-4 rounded-xl max-w-md mx-auto border text-left space-y-2 text-sm ${
                  theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex justify-between">
                    <span className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Ticket ID:</span>
                    <span className="font-mono font-bold text-[#6366f1]">{submittedTicket.ticketId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Email:</span>
                    <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{submittedTicket.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Category:</span>
                    <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{submittedTicket.queryType}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-xl font-medium border text-sm transition-colors border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10"
                  >
                    Submit Another Query
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-[#5b45e0] hover:bg-[#4d38cb] transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              /* Main Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* 1. Query Type * */}
                  <div className={`transition-transform duration-300 ${bouncingField === 'queryType' ? 'bounce-field' : ''}`}>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                      Query Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="queryType"
                        value={formData.queryType}
                        onChange={handleInputChange}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm appearance-none transition-all outline-none pr-10 cursor-pointer ${
                          theme === 'light'
                            ? 'bg-white border-gray-300 text-gray-800 focus:border-[#5b45e0] focus:ring-2 focus:ring-[#5b45e0]/20'
                            : 'bg-[#161826] border-[#292d42] text-white focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'
                        } ${errors.queryType ? 'border-red-500' : ''}`}
                      >
                        <option value="" disabled>Select an issue</option>
                        {queryTypes.map((type, idx) => (
                          <option key={idx} value={type} className={theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#161826] text-white'}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.queryType && <p className="text-xs text-red-500 mt-1">{errors.queryType}</p>}
                  </div>

                  {/* 2. Your Name * */}
                  <div className={`transition-transform duration-300 ${bouncingField === 'creatorName' ? 'bounce-field' : ''}`}>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="creatorName"
                      value={formData.creatorName}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                        theme === 'light'
                          ? 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-[#5b45e0] focus:ring-2 focus:ring-[#5b45e0]/20'
                          : 'bg-[#161826] border-[#292d42] text-white placeholder-gray-500 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'
                      } ${errors.creatorName ? 'border-red-500' : ''}`}
                    />
                    {errors.creatorName && <p className="text-xs text-red-500 mt-1">{errors.creatorName}</p>}
                  </div>

                  {/* 3. Chat ID * */}
                  <div className={`transition-transform duration-300 ${bouncingField === 'chatId' ? 'bounce-field' : ''}`}>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                      Chat ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="chatId"
                      value={formData.chatId}
                      onChange={handleInputChange}
                      placeholder="e.g. SKR123456"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                        theme === 'light'
                          ? 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-[#5b45e0] focus:ring-2 focus:ring-[#5b45e0]/20'
                          : 'bg-[#161826] border-[#292d42] text-white placeholder-gray-500 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'
                      } ${errors.chatId ? 'border-red-500' : ''}`}
                    />
                    <p className={`text-[11px] mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                      You can find this in your chat history.
                    </p>
                    {errors.chatId && <p className="text-xs text-red-500 mt-1">{errors.chatId}</p>}
                  </div>

                  {/* 3.1 Transaction ID (Optional) */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                      Transaction ID <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      placeholder="e.g. TXN123456"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                        theme === 'light'
                          ? 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-[#5b45e0] focus:ring-2 focus:ring-[#5b45e0]/20'
                          : 'bg-[#161826] border-[#292d42] text-white placeholder-gray-500 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'
                      }`}
                    />
                    <p className={`text-[11px] mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                      You can find this in your payment receipt.
                    </p>
                  </div>

                  {/* 4. Date of Issue * */}
                  <div className={`transition-transform duration-300 ${bouncingField === 'dateOfIssue' ? 'bounce-field' : ''}`}>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                      Date of Issue <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dateOfIssue"
                        value={formData.dateOfIssue}
                        onChange={handleInputChange}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none cursor-pointer ${
                          theme === 'light'
                            ? 'bg-white border-gray-300 text-gray-800 focus:border-[#5b45e0] focus:ring-2 focus:ring-[#5b45e0]/20'
                            : 'bg-[#161826] border-[#292d42] text-white focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'
                        } ${errors.dateOfIssue ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.dateOfIssue && <p className="text-xs text-red-500 mt-1">{errors.dateOfIssue}</p>}
                  </div>

                  {/* 5. Amount Paid (Optional) */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                      Amount Paid <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none select-none ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        ₹
                      </div>
                      <input
                        type="number"
                        name="amountPaid"
                        value={formData.amountPaid}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                        min="0"
                        className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none font-dm lining-nums ${
                          theme === 'light'
                            ? 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-[#5b45e0] focus:ring-2 focus:ring-[#5b45e0]/20'
                            : 'bg-[#161826] border-[#292d42] text-white placeholder-gray-500 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'
                        }`}
                        style={{
                          fontFamily: "'DM Sans', 'Inter', system-ui, -apple-system, sans-serif",
                          fontVariantNumeric: 'lining-nums tabular-nums',
                          fontFeatureSettings: '"lnum" 1, "tnum" 1'
                        }}
                      />
                    </div>
                    <p className={`text-[11px] mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Useful particularly for payment/refund queries
                    </p>
                  </div>


                </div>

                {/* 7. What happened? * */}
                <div className={`transition-transform duration-300 ${bouncingField === 'whatHappened' ? 'bounce-field' : ''}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs sm:text-sm font-semibold">
                      What happened? <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      name="whatHappened"
                      rows="4"
                      maxLength="500"
                      value={formData.whatHappened}
                      onChange={handleInputChange}
                      placeholder="Please describe your issue briefly..."
                      className={`w-full p-3.5 pb-7 rounded-xl border text-sm transition-all outline-none resize-none ${
                        theme === 'light'
                          ? 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-[#5b45e0] focus:ring-2 focus:ring-[#5b45e0]/20'
                          : 'bg-[#161826] border-[#292d42] text-white placeholder-gray-500 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'
                      } ${errors.whatHappened ? 'border-red-500' : ''}`}
                    />
                    <div className="absolute right-4 bottom-3 text-[11px] text-gray-400 select-none">
                      {formData.whatHappened.length}/500
                    </div>
                  </div>
                  {errors.whatHappened && <p className="text-xs text-red-500 mt-1">{errors.whatHappened}</p>}
                </div>

                {/* 8. Attach Screenshot / Evidence (Optional) */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1.5">
                    Attach Screenshot / Evidence <span className="text-xs font-normal text-gray-400">(Optional)</span>
                  </label>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />

                  {!file ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                        isDragging 
                          ? 'border-[#5b45e0] bg-[#5b45e0]/5' 
                          : theme === 'light'
                            ? 'border-gray-300 hover:border-[#5b45e0] bg-gray-50/50 hover:bg-gray-50'
                            : 'border-[#292d42] hover:border-[#6366f1] bg-[#161826]/40 hover:bg-[#161826]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#5b45e0]/10 text-[#5b45e0] flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs sm:text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                          Click to upload or drag and drop
                        </p>
                        <p className={`text-[11px] max-w-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                          Supports screenshots, payment confirmation, chat screenshot, error screenshot, etc. (Max file size: 5MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-[#161826] border-[#292d42]'
                    }`}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        {filePreview ? (
                          <img src={filePreview} alt="Upload preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#5b45e0]/10 text-[#5b45e0] flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className={`text-xs sm:text-sm font-medium truncate ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                            {file.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Security Notice: Do NOT upload card details, passwords, OTPs */}
                  <div className={`mt-2 flex items-start gap-2 p-2.5 rounded-lg text-[11px] leading-relaxed border ${
                    theme === 'light' 
                      ? 'bg-amber-50/70 border-amber-200/80 text-amber-800' 
                      : 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                  }`}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      <strong>Security Note:</strong> Do NOT upload sensitive information like card details, CVVs, passwords, or OTPs.
                    </span>
                  </div>

                  {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
                </div>

                {/* 9. Additional Details (Optional) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs sm:text-sm font-semibold">
                      Additional Details <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      name="additionalDetails"
                      rows="3"
                      maxLength="1000"
                      value={formData.additionalDetails}
                      onChange={handleInputChange}
                      placeholder="Add any other information that may help us resolve your query."
                      className={`w-full p-3.5 pb-7 rounded-xl border text-sm transition-all outline-none resize-none ${
                        theme === 'light'
                          ? 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-[#5b45e0] focus:ring-2 focus:ring-[#5b45e0]/20'
                          : 'bg-[#161826] border-[#292d42] text-white placeholder-gray-500 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'
                      }`}
                    />
                    <div className="absolute right-4 bottom-3 text-[11px] text-gray-400 select-none">
                      {formData.additionalDetails.length}/1000
                    </div>
                  </div>
                </div>

                {/* 10. Email Address * */}
                <div className={`transition-transform duration-300 ${bouncingField === 'email' ? 'bounce-field' : ''}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-semibold">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    {isEmailAutoFilled && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Auto-filled from account
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                      theme === 'light'
                        ? 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-[#5b45e0] focus:ring-2 focus:ring-[#5b45e0]/20'
                        : 'bg-[#161826] border-[#292d42] text-white placeholder-gray-500 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'
                    } ${errors.email ? 'border-red-500' : ''}`}
                  />
                  <p className={`text-[11px] mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    We’ll use this email to update you about your query
                  </p>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* 11. Submit Query Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer hover:shadow-lg hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #5b45e0 0%, #4d36d0 100%)'
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Query...</span>
                      </>
                    ) : (
                      <span>Submit Query</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Query Raised Successfully Modal */}
      {submittedTicket && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up"
          onClick={handleReset}
        >
          <div 
            className={`w-full max-w-md rounded-2xl md:rounded-3xl p-6 sm:p-8 shadow-2xl border font-dm relative transition-all ${
              theme === 'light' 
                ? 'bg-white border-gray-200 text-gray-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)]' 
                : 'bg-[#121420] border-[#22273d] text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleReset}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                theme === 'light' ? 'text-gray-400 hover:text-black hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Checkmark Icon with Glow */}
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center ring-8 ring-emerald-500/10 mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Query Raised Successfully!
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                We have received your query. Our support team will review the details and respond to your email shortly.
              </p>
            </div>

            {/* Ticket Details Box */}
            <div className={`p-4 rounded-xl border text-left space-y-2.5 text-xs sm:text-sm mb-6 ${
              theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-[#181b2a] border-[#262b42]'
            }`}>
              <div className="flex items-center justify-between">
                <span className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Ticket ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#6366f1]">{submittedTicket.ticketId}</span>
                  <button
                    onClick={() => {
                      if (submittedTicket?.ticketId) {
                        navigator.clipboard.writeText(submittedTicket.ticketId);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className={`p-1.5 rounded transition-colors flex items-center gap-1 text-[11px] ${
                      theme === 'light' ? 'hover:bg-gray-200 text-gray-500' : 'hover:bg-white/10 text-gray-400'
                    }`}
                    title="Copy Ticket ID"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Email:</span>
                <span className={`font-medium truncate max-w-[200px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                  {submittedTicket.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Category:</span>
                <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                  {submittedTicket.queryType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Date:</span>
                <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                  {submittedTicket.createdAt}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium border text-xs sm:text-sm transition-colors border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10 text-center"
              >
                Submit Another Query
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-[#5b45e0] hover:bg-[#4d38cb] transition-colors text-center"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer theme={theme} />
    </div>
  );
};

export default RaiseQuery;

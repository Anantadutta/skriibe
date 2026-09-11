import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { getCreatorProfile } from '../../services/discoveryApi';
import { getFanHistory } from '../../services/fanApi';
import { checkIfLiveNow } from '../../utils/timeUtils';
import PaymentButton from '../../components/PaymentButton';
import WalletPaymentButton from '../../components/fan/WalletPaymentButton';
import WalletRechargeScreen from '../../components/fan/WalletRechargeScreen';
import StartChatModal from '../../components/fan/StartChatModal';
import { getImageUrl } from '../../utils/imageUtils';
import { getExpertiseIcon } from '../../utils/expertiseIcons';

const CreatorProfile = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isFollowUp = searchParams.get('isFollowUp') === 'true';
  const autoAsk = searchParams.get('autoAsk') === 'true';
  const hideAskMeAnything = location.state?.intent === 'live';
  const parentQuestionId = searchParams.get('parentQuestionId');
  const isPreview = searchParams.get('preview') === 'true';
  
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [step, setStep] = useState((isFollowUp || autoAsk) ? 'ask' : 'overview'); // 'overview' | 'ask'
  const [question, setQuestion] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState('');

  const [loggedInCreatorHandle, setLoggedInCreatorHandle] = useState(null);

  const [agreed, setAgreed] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [paymentTab, setPaymentTab] = useState('UPI');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showStuckModal, setShowStuckModal] = useState(location.state?.showStuckModal || false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  useEffect(() => {
    // Clear history state to prevent modal reappearing on refresh
    if (location.state?.showStuckModal) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const data = await getCreatorProfile(handle);
        if (data.success && data.creator) {
          setCreator(data.creator);
        } else {
          setFetchError('Creator not found');
        }
      } catch (err) {
        setFetchError('Failed to load creator profile');
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, [handle]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/fan-auth/me');
        if (res.data?.fan) {
          setBuyerName(res.data.fan.name || '');
          setBuyerEmail(res.data.fan.email || '');
          if (res.data.fan.creatorHandle) {
            setLoggedInCreatorHandle(res.data.fan.creatorHandle);
          }
          
          let fetchedPhone = res.data.fan.whatsappPhone || res.data.fan.phone || '';
          if (fetchedPhone.startsWith('+91')) {
            fetchedPhone = fetchedPhone.replace(/^\+91/, '');
          }
          setBuyerPhone(fetchedPhone);

          let activeBan = res.data.fan.isBanned || false;
          if (activeBan && res.data.fan.banExpiresAt) {
            if (new Date(res.data.fan.banExpiresAt) < new Date()) {
              activeBan = false;
            }
          }
          setIsBanned(activeBan);
          setIsFirstTimeUser(!res.data.fan.hasUsedFreeChat);
          setIsLoggedIn(true);

          try {
            const walletRes = await api.get('/wallet/balance');
            if (walletRes.data.success) {
              setWalletBalance(walletRes.data.balance || 0);
            }
          } catch (e) {
            console.error('Failed to fetch wallet balance:', e);
          }
        }
      } catch (err) {
        try {
          const cRes = await api.get('/creators/me');
          if (cRes.data?.creator) {
            setBuyerName(cRes.data.creator.name || '');
            setBuyerEmail(cRes.data.creator.email || '');
            setLoggedInCreatorHandle(cRes.data.creator.handle);
            
            let fetchedPhone = cRes.data.creator.phone || '';
            if (fetchedPhone.startsWith('+91')) {
              fetchedPhone = fetchedPhone.replace(/^\+91/, '');
            }
            setBuyerPhone(fetchedPhone);
            
            setIsLoggedIn(true);
          }
        } catch (e) {
          setIsLoggedIn(false);
        }
      }
    };
    fetchUser();
  }, []);

  const [followUpThread, setFollowUpThread] = useState([]);

  useEffect(() => {
    if (isFollowUp && parentQuestionId && isLoggedIn) {
      const fetchThread = async () => {
        try {
          const res = await getFanHistory();
          if (res.success && res.questions) {
            const thread = [
              res.questions.find(q => q._id === parentQuestionId),
              ...res.questions.filter(q => q.parentQuestionId === parentQuestionId)
            ].filter(Boolean).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
            setFollowUpThread(thread);
          }
        } catch (e) {
          console.error('Failed to fetch follow-up thread', e);
        }
      };
      fetchThread();
    }
  }, [isFollowUp, parentQuestionId, isLoggedIn]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Loading profile...
      </div>
    );
  }

  if (fetchError || !creator) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
        <h2>{fetchError || 'Creator not found'}</h2>
        <button 
          onClick={() => navigate(isPreview ? '/creator/dashboard' : '/explore')} 
          style={{ background: '#38bdf8', color: '#000', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '16px', fontWeight: 'bold' }}
        >
          {isPreview ? 'Back to Dashboard' : 'Back to Explore'}
        </button>
      </div>
    );
  }

  const price = creator.pricePerQuestion;
  const replyRate = creator.stats?.replyRate || 100;
  const avgReply = creator.stats?.avgReplyTime || 0;
  const answeredCount = creator.stats?.totalAnswered || creator.questionsAnswered || 0;
  
  const isOwner = Boolean(loggedInCreatorHandle && creator?.handle && loggedInCreatorHandle.toLowerCase() === creator.handle.toLowerCase());
  const effectiveIsPreview = isPreview || isOwner;

  let dynamicallyLive = false;
  if (creator.isPaused) {
    dynamicallyLive = false;
  } else if (creator.isLive === true) {
    dynamicallyLive = true;
  } else {
    dynamicallyLive = checkIfLiveNow(creator.liveChatTimeSlots);
  }

  // Format reply time (e.g. 3.2h)
  const formatTime = (time) => {
    if (typeof time === 'string') return time;
    if (time === 0) return '<24h';
    if (time < 1) return `${Math.max(1, Math.round(time * 60))}m`;
    return `${time.toFixed(1)}h`;
  };

  const handleSubmit = async () => {
    if (question.length < 20 || question.length > 500) return;
    if (!agreed || !buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) return;

    setSubmitLoading(true);
    setSubmitError('');
    try {
      const response = await api.post('/questions', {
        creatorId: creator.id || creator._id,
        questionText: question,
        buyerName,
        buyerEmail,
        buyerPhone,
        isFollowUp,
        parentQuestionId
      });
      if (response.data?.question?.orderNumber) {
        setOrderId(response.data.question.orderNumber);
      } else if (response.data?.question?._id) {
        setOrderId(response.data.question._id);
      } else {
        setOrderId('SKR-' + Math.floor(100000 + Math.random() * 900000));
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.requiresRecharge) {
        setShowRechargeModal(true);
      } else {
        setSubmitError(err.response?.data?.message || 'Failed to send question. Please try again.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (showRechargeModal) {
    return (
      <WalletRechargeScreen 
        rate={price} 
        balance={walletBalance} 
        onCancel={() => setShowRechargeModal(false)}
        onRechargeSuccess={async (newBalance) => {
          setWalletBalance(newBalance);
          setShowRechargeModal(false);
          // Automatically try submitting again now that they have balance
          await handleSubmit();
        }}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'Inter, var(--font-body, sans-serif)',
      position: 'relative'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Back button */}
        <button 
          onClick={() => {
            if (isPreview) navigate(-1);
            else if (isLoggedIn) navigate('/explore');
            else navigate('/');
          }}
          style={{
            alignSelf: 'flex-start',
            marginBottom: '32px',
            background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px',
            padding: '8px 16px', fontSize: '14px', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
        >
          ← Back
        </button>
        {success ? (
          <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '24px' }}>
            
            {/* Success Icon */}
            <div style={{
              width: '72px', height: '72px',
              borderRadius: '50%',
              background: '#062c19', // Dark green background
              border: '2px solid #10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 style={{ margin: '0 0 12px', color: '#fff', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Message sent!
            </h2>
            <p style={{ color: '#94a3b8', margin: '0 0 32px', fontSize: '15px', lineHeight: '1.6', textAlign: 'center' }}>
              <span style={{ color: '#fff', fontWeight: '600' }}>{creator.name}</span> {isFollowUp ? 'has received your follow-up.' : 'will reply within 24 hours.'} You'll be notified on both channels.
            </p>

            {/* Delivery Channels Box */}
            <div style={{
              width: '100%', background: '#131313', border: '1px solid #1f1f1f',
              borderRadius: '16px', padding: '20px', marginBottom: '16px', boxSizing: 'border-box'
            }}>
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '16px' }}>DELIVERY CHANNELS</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                  {buyerEmail}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                  Skriibe Inbox
                </div>
              </div>
            </div>

            {/* Order Box */}
            <div style={{
              width: '100%', background: '#131313', border: '1px solid #1f1f1f',
              borderRadius: '16px', padding: '20px', marginBottom: '32px', boxSizing: 'border-box',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                  Order #{orderId.startsWith('SKR') ? orderId : 'SKR-' + orderId.slice(-8).toUpperCase()}
                </div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>
                  Amount paid · {isFollowUp ? 'Free' : `₹${price}`}
                </div>
              </div>
              <div style={{
                background: '#062c19', color: '#10b981', fontSize: '12px', fontWeight: '700',
                padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                ✓ {isFollowUp ? 'Claimed' : 'Paid'}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/fan/history')}
                style={{
                  background: 'linear-gradient(90deg, #34d399, #10b981)',
                  color: '#000', border: 'none', borderRadius: '16px',
                  padding: '16px', fontWeight: '700', fontSize: '15px',
                  width: '100%', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
                }}
              >
                View my message
              </button>



              <button
                onClick={() => navigate('/explore')}
                style={{
                  background: '#131313',
                  color: '#fff', border: '1px solid #1f1f1f', borderRadius: '16px',
                  padding: '16px', fontWeight: '600', fontSize: '15px',
                  width: '100%', cursor: 'pointer'
                }}
              >
                Back to profile
              </button>
            </div>

          </div>
        ) : step === 'overview' ? (
          // STEP 1: Profile Overview
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Header: Avatar + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', width: '100%', justifyContent: 'center' }}>
              
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                {creator.avatarUrl ? (
                  <img 
                    src={getImageUrl(creator.avatarUrl)} 
                    alt={creator.name} 
                    style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      border: '2px solid #38bdf8', objectFit: 'cover'
                    }} 
                  />
                ) : (
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: '#131313', border: '2px solid #38bdf8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '900', fontSize: '24px', color: '#ffffff'
                  }}>
                    {creator.name ? creator.name[0].toUpperCase() : 'C'}
                  </div>
                )}
              </div>

              {/* Name & Handle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h2 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                  {creator.name}
                </h2>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
                  {creator.handle}
                </div>
              </div>
              
            </div>

            {/* Instagram Linked Pill */}
            {creator.instagramLinked && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #db2777',
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#f472b6',
                marginBottom: '20px'
              }}>
                📸 Instagram linked
              </div>
            )}

            {/* Topic Tags & Live */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {creator.expertise?.map(exp => {
                const icon = getExpertiseIcon(exp, 12);
                return (
                  <span key={exp} style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    color: '#06b6d4',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {icon}
                    {exp}
                  </span>
                );
              })}
              {dynamicallyLive && (
                <span style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
                  LIVE
                </span>
              )}
            </div>

            {/* Stats Row */}


            {/* Bio */}
            <div style={{ 
              color: '#94a3b8', 
              fontSize: '14px', 
              lineHeight: '1.6', 
              textAlign: 'left', 
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '16px',
              marginBottom: '16px', 
              width: '100%',
              boxSizing: 'border-box',
              whiteSpace: 'pre-wrap' 
            }}>
              {creator.bio || "Heyyy! Got something on your mind? Let’s chat!"}
            </div>

            {/* Large Bottom Booking Card */}
            {creator.liveChatEnabled === true && !creator.isPaused && (
              <div style={{
                background: 'linear-gradient(145deg, #13161C, #0a0f16)',
                border: '1px solid rgba(59, 168, 216, 0.3)',
                borderRadius: '24px',
                padding: '24px',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#3BA8D8', borderRadius: '50%', boxShadow: '0 0 8px #3BA8D8' }} />
                    Live Chat
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      color: '#fff', 
                      fontSize: '18px',
                      fontWeight: '800', 
                      background: 'linear-gradient(135deg, #38BDF8 0%, #2563EB 100%)', 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      marginRight: '8px',
                      boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
                      letterSpacing: '0.5px',
                      display: 'inline-block'
                    }}>
                      ₹{creator.liveChatPrice || 5}/min
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {!dynamicallyLive && 'Currently offline'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (dynamicallyLive === false && !effectiveIsPreview) {
                      alert('Creator is offline. Try again later.');
                      return;
                    }
                    if (isBanned || effectiveIsPreview) return;
                    if (!isLoggedIn && !effectiveIsPreview) {
                      navigate(`/fan/login?redirect=/${handle}/live-chat`);
                    } else {
                      if (isFirstTimeUser) {
                        navigate(`/${handle}/live-chat`);
                      } else {
                        setShowChatModal(true);
                      }
                    }
                  }}
                  style={{
                    background: (isBanned || effectiveIsPreview || dynamicallyLive === false) ? '#333' : '#3BA8D8',
                    color: (isBanned || effectiveIsPreview || dynamicallyLive === false) ? '#888' : '#fff',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '12px 24px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: (isBanned || effectiveIsPreview || dynamicallyLive === false) ? 'not-allowed' : 'pointer',
                    boxShadow: (isBanned || effectiveIsPreview || dynamicallyLive === false) ? 'none' : '0 4px 14px rgba(59, 168, 216, 0.3)'
                  }}
                >
                  {isFirstTimeUser ? 'Start Free Chat' : 'Start Chat'}
                </button>
              </div>
            )}

            {!hideAskMeAnything && dynamicallyLive === false && (
              <>
                {creator.ama_enabled !== false && (
                  <div style={{
                    background: '#131313',
                    border: '1px solid #1f1f1f',
                    borderRadius: '24px',
                    padding: '32px 24px',
                    width: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.02)',
                    marginBottom: isOwner ? '16px' : '0'
                  }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', marginBottom: '16px' }}>
                      ASK ME ANYTHING
                    </div>
                          
                          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                            {isFollowUp ? (
                              <span style={{ color: '#10b981', fontSize: '56px', fontWeight: '800', lineHeight: '1' }}>Free</span>
                            ) : (
                              <>
                                <span style={{ color: '#fff', fontSize: '24px', fontWeight: '600', marginTop: '6px', marginRight: '4px' }}>₹</span>
                                <span style={{ color: '#fff', fontSize: '56px', fontWeight: '800', lineHeight: '1' }}>{price}</span>
                              </>
                            )}
                          </div>

                          {!isFollowUp && (
                            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: '#fb923c' }}>⚡</span> I'll reply within 24 hrs
                            </div>
                          )}

                          <button
                            onClick={() => {
                              if (isBanned || effectiveIsPreview) return;
                              if (!isLoggedIn && !effectiveIsPreview) {
                                navigate(`/fan/login?redirect=/${handle}?autoAsk=true`);
                              } else {
                                setStep('ask');
                              }
                            }}
                            style={{
                              background: (isBanned || effectiveIsPreview) ? '#333' : 'linear-gradient(90deg, #34d399, #10b981)',
                              color: (isBanned || effectiveIsPreview) ? '#888' : '#000',
                              border: 'none',
                              borderRadius: '100px',
                              padding: '16px',
                              fontWeight: '700',
                              fontSize: '16px',
                              width: '100%',
                              cursor: (isBanned || effectiveIsPreview) ? 'not-allowed' : 'pointer',
                              transition: 'transform 0.2s',
                              boxShadow: (isBanned || effectiveIsPreview) ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.3)',
                            }}
                            onMouseOver={(e) => { if (!isBanned && !effectiveIsPreview) e.currentTarget.style.transform = 'scale(1.02)' }}
                            onMouseOut={(e) => { if (!isBanned && !effectiveIsPreview) e.currentTarget.style.transform = 'scale(1)' }}
                          >
                            {effectiveIsPreview ? 'Preview Mode' : (isBanned ? 'Action Restricted' : (isFollowUp ? 'Ask for free →' : 'Ask Now →'))}
                          </button>
                  </div>
                )}

                {isOwner && (
                  <button
                    onClick={() => navigate('/creator/dashboard')}
                    style={{
                      background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '100px',
                      padding: '16px',
                      fontWeight: '700',
                      fontSize: '16px',
                      width: '100%',
                      cursor: 'pointer',
                      marginTop: '12px',
                      transition: 'transform 0.2s',
                      boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Go to Dashboard →
                  </button>
                )}
              </>
            )}

          </div>
        ) : step === 'ask' && (
          // STEP 2: Ask Question Form (Redesigned Checkout)
          <div style={{ width: '100%' }}>
            
            {/* Header: Back & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <button
                onClick={() => setStep('overview')}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8', cursor: 'pointer'
                }}
              >
                ←
              </button>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                Ask <span style={{ color: '#38bdf8' }}>@{creator.handle}</span>
              </h2>
            </div>

            {/* Follow Up Thread Display */}
            {isFollowUp && followUpThread.length > 0 && (
              <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '700' }}>Previous Conversation</h3>
                <div style={{ background: '#131313', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {followUpThread.map((q, idx) => (
                    <div key={q._id || idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: '#38bdf8', fontSize: '12px', fontWeight: '600' }}>{q.buyerName || 'You'}</div>
                      </div>
                      <div style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{q.questionText}</div>
                      {q.answerText && (
                        <div style={{ marginTop: '4px', borderLeft: '2px solid #10b981', paddingLeft: '12px' }}>
                          <div style={{ color: '#10b981', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>{creator.name} replied:</div>
                          <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{q.answerText}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer Box */}
            <div style={{
                  background: '#1a110b',
                  border: '1px solid #451a03',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '16px'
                }}>
                  <div style={{ color: '#fb923c', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️</span> READ BEFORE CONTINUING
                  </div>
                  <ol style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', listStyleType: 'decimal' }}>
                    <li style={{ paddingLeft: '4px' }}>Ask one clear message, per payment for the best response.</li>
                    <li style={{ paddingLeft: '4px' }}>Be respectful. Abusive, hateful, or vulgar content is not allowed.</li>
                    <li style={{ paddingLeft: '4px' }}>Share only what's needed for a helpful answer.</li>
                  </ol>
                </div>

                {/* Agreement Checkbox */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  background: '#131313', border: '1px solid #1f1f1f',
                  borderRadius: '12px', padding: '16px', cursor: 'pointer',
                  marginBottom: '32px'
                }}>
                  <input 
                    type="checkbox" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: '#38bdf8', cursor: 'pointer', marginTop: '2px', flexShrink: 0 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>I understand and agree</span>
                    <span style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.4 }}>By logging in and using Skriibe, you agree to our <a href="https://www.skriibe.com/terms" style={{ color: '#38bdf8', textDecoration: 'none' }}>Terms of Service</a> and <a href="https://www.skriibe.com/privacy" style={{ color: '#38bdf8', textDecoration: 'none' }}>Privacy Policy</a>.</span>
                  </div>
                </label>

            {/* Question Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: '#131313', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '12px 16px' }}>
                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '8px' }}>
                  TYPE YOUR MESSAGE HERE <span style={{ color: '#ef4444' }}>*</span>
                  <span style={{ color: '#64748b', fontSize: '9px', marginLeft: '6px', letterSpacing: 'normal', fontWeight: '600', textTransform: 'none' }}>(Min 20 and Max 500 characters)</span>
                </div>
                <textarea 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`What do you want to ask @${creator.handle}?`}
                  style={{ width: '100%', height: '100px', background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', color: '#64748b', fontSize: '12px', padding: '0 4px' }}>
                <span style={{ color: question.length > 500 ? '#ef4444' : '#64748b' }}>
                  {question.length}/500 Characters
                </span>
              </div>
            </div>

            {!isFollowUp && (
              <>
                <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 16px' }}>Your details</h3>

                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  
                  {/* Name */}
                  <div style={{ background: '#131313', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '12px 16px' }}>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '4px' }}>NAME <span style={{ color: '#ef4444' }}>*</span></div>
                    <input 
                      type="text" 
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="e.g. Amit Kumar"
                      style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', outline: 'none' }}
                    />
                  </div>

                  {/* Email */}
                  <div style={{ background: '#131313', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '12px 16px' }}>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '4px' }}>EMAIL ADDRESS <span style={{ color: '#ef4444' }}>*</span></div>
                    <input 
                      type="email" 
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="e.g. amit@gmail.com"
                      style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', outline: 'none' }}
                    />
                  </div>

                  {/* WhatsApp */}
                  <div style={{ background: '#131313', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '12px 16px' }}>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '4px' }}>WHATSAPP NUMBER <span style={{ color: '#ef4444' }}>*</span></div>
                    <input 
                      type="tel" 
                      maxLength={10}
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="e.g. 9876543210"
                      style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', outline: 'none' }}
                    />
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                      It should only be a 10 digit number.
                    </div>
                  </div>

                </div>
              </>
            )}

            {submitError && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            {isFollowUp ? (
              <button
                onClick={handleSubmit}
                disabled={!agreed || question.length < 20 || question.length > 500 || submitLoading}
                style={{
                  width: '100%',
                  background: (!agreed || question.length < 20 || question.length > 500 || submitLoading) ? '#062c19' : 'linear-gradient(90deg, #34d399, #10b981)',
                  color: (!agreed || question.length < 20 || question.length > 500 || submitLoading) ? '#10b981' : '#000',
                  border: (!agreed || question.length < 20 || question.length > 500 || submitLoading) ? '1px solid rgba(16, 185, 129, 0.2)' : 'none',
                  borderRadius: '16px',
                  padding: '18px',
                  fontSize: '1.1rem',
                  fontWeight: '800',
                  cursor: (!agreed || question.length < 20 || question.length > 500 || submitLoading) ? 'not-allowed' : 'pointer',
                  opacity: (!agreed || question.length < 20 || question.length > 500 || submitLoading) ? 0.6 : 1,
                  boxShadow: (!agreed || question.length < 20 || question.length > 500 || submitLoading) ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {submitLoading ? 'Processing...' : 'Ask for free.'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!agreed || question.length < 20 || question.length > 500 || !buyerName.trim() || !buyerEmail.trim() || buyerPhone.length !== 10 || submitLoading}
                style={{
                  width: '100%',
                  background: (!agreed || question.length < 20 || question.length > 500 || !buyerName.trim() || !buyerEmail.trim() || buyerPhone.length !== 10 || submitLoading) ? '#062c19' : 'linear-gradient(90deg, #34d399, #10b981)',
                  color: (!agreed || question.length < 20 || question.length > 500 || !buyerName.trim() || !buyerEmail.trim() || buyerPhone.length !== 10 || submitLoading) ? '#10b981' : '#000',
                  border: (!agreed || question.length < 20 || question.length > 500 || !buyerName.trim() || !buyerEmail.trim() || buyerPhone.length !== 10 || submitLoading) ? '1px solid rgba(16, 185, 129, 0.2)' : 'none',
                  borderRadius: '16px',
                  padding: '18px',
                  fontSize: '1.1rem',
                  fontWeight: '800',
                  cursor: (!agreed || question.length < 20 || question.length > 500 || !buyerName.trim() || !buyerEmail.trim() || buyerPhone.length !== 10 || submitLoading) ? 'not-allowed' : 'pointer',
                  opacity: (!agreed || question.length < 20 || question.length > 500 || !buyerName.trim() || !buyerEmail.trim() || buyerPhone.length !== 10 || submitLoading) ? 0.6 : 1,
                  boxShadow: (!agreed || question.length < 20 || question.length > 500 || !buyerName.trim() || !buyerEmail.trim() || buyerPhone.length !== 10 || submitLoading) ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {submitLoading ? 'Processing...' : `Pay ₹${price} — Wallet`}
              </button>
            )}

            {!isFollowUp && (
              <div style={{ color: '#64748b', fontSize: '12px', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                <span>🔒</span> Secure wallet payment

              </div>
            )}

          </div>
        )}
      </div>

      {showChatModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#131313',
            border: '1px solid #1f1f1f',
            borderRadius: '24px',
            padding: '32px 24px',
            width: '90%',
            maxWidth: '400px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
              Start chat with {creator.name}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              {isFirstTimeUser ? 'This is your first live chat, so it is completely FREE!' : `You will be charged ₹${creator.liveChatPrice || 5} per minute for this live session.`}
            </p>
            <button
              onClick={() => {
                if (isFirstTimeUser) {
                  navigate(`/${handle}/live-chat`);
                } else {
                  navigate(`/${handle}/recharge`);
                }
              }}
              style={{
                background: '#3BA8D8',
                color: '#fff',
                border: 'none',
                borderRadius: '100px',
                padding: '14px 24px',
                fontWeight: '800',
                fontSize: '16px',
                width: '100%',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              Confirm & Start
            </button>
            <button
              onClick={() => setShowChatModal(false)}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: 'none',
                padding: '10px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stuck Modal */}
      {showStuckModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 10, 15, 0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: '#13161C',
            borderRadius: '32px',
            padding: '40px 24px',
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'visible'
          }}>
            <h2 style={{ color: '#fff', fontSize: '32px', fontWeight: 800, margin: '0 0 20px 0', letterSpacing: '-0.5px' }}>
              Oops, missed <span style={{ position: 'relative', display: 'inline-block' }}>
                you!
                <svg style={{ position: 'absolute', bottom: '-4px', left: '0', width: '100%', height: '8px' }} viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 Q25,5 50,15 T100,5" fill="none" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            
            <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.5', margin: '0 0 28px 0', padding: '0 10px', fontWeight: 500 }}>
              The creator is currently chatting <span style={{ color: '#F43F5E' }}>with another fan.</span> 💬 We couldn't connect you this time.
            </p>

            <div style={{ 
              width: '100%', 
              background: 'rgba(167, 139, 250, 0.03)', 
              border: '2px dashed rgba(167, 139, 250, 0.3)', 
              borderRadius: '16px', 
              padding: '16px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              marginBottom: '32px',
              position: 'relative'
            }}>
              <svg style={{ position: 'absolute', top: '-24px', right: '-16px', transform: 'rotate(15deg)' }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4"></path><path d="M19.07 4.93l-2.83 2.83"></path><path d="M22 12h-4"></path>
              </svg>
              
              <div style={{ flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '16px', textAlign: 'left', lineHeight: '1.4', fontWeight: 500 }}>
                Don't worry, we'll <span style={{ color: '#A78BFA', fontWeight: 600 }}>notify you</span> as soon as they're free!
              </div>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
              <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%) rotate(-15deg)' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4"></path><path d="M5.5 5.5l2.5 2.5"></path><path d="M2 12h4"></path>
              </svg>
              
              <button
                onClick={() => setShowStuckModal(false)}
                style={{
                  background: 'linear-gradient(90deg, #F472B6 0%, #A78BFA 100%)',
                  color: '#111',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '16px 32px',
                  fontWeight: '800',
                  fontSize: '20px',
                  cursor: 'pointer',
                  width: '85%',
                  boxShadow: '0 8px 24px rgba(167, 139, 250, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                Got it! 👋
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorProfile;

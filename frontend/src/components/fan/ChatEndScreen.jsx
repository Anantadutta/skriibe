import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import WalletPaymentButton from './WalletPaymentButton';

const ChatEndScreen = ({ creator, sessionId, totalMinutes, totalCost, error, messages = [], isFreeChat, rate, walletBalance: initialWalletBalance, onBack, onContinueChat, onDone }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [showTipSelector, setShowTipSelector] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState('');
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [successTipAmount, setSuccessTipAmount] = useState(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [showContinueRechargeModal, setShowContinueRechargeModal] = useState(false);
  const [continueRechargeData, setContinueRechargeData] = useState({
    balance: 0,
    required: 0,
    rate: 0,
    shortfall: 0
  });
  const [continueRechargeAmount, setContinueRechargeAmount] = useState(50);
  const navigate = useNavigate();

  // Calculate detailed duration
  const mins = Math.floor(totalMinutes);
  const secs = Math.round((totalMinutes - mins) * 60);
  const durationText = `${mins} min ${secs} s`;

  const tags = ['Helpful', 'Fast', 'Friendly'];

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleDone = async () => {
    if (rating > 0 || selectedTags.length > 0 || feedback.trim()) {
      try {
        await api.post('/chat/review', {
          sessionId,
          creatorId: creator?._id || creator?.id,
          rating,
          tags: selectedTags,
          feedback: feedback.trim()
        });
      } catch (err) {
        console.error('Failed to submit review:', err);
      }
    }
    if (onDone) onDone();
    else if (onBack) onBack();
  };

  const handleContinueChatClick = async () => {
    if (isCheckingBalance) return;
    setIsCheckingBalance(true);

    try {
      const res = await api.get('/wallet/balance');
      const balance = res.data?.balance ?? initialWalletBalance ?? 0;
      const hasUsedFree = res.data?.hasUsedFreeChat ?? (!isFreeChat);

      const effectiveRate = Number(rate || creator?.liveChatPrice || creator?.liveChatRate || 5);
      const required = effectiveRate * 5;
      const canFreeChat = !hasUsedFree && !isFreeChat;

      if (canFreeChat || balance >= required) {
        setIsCheckingBalance(false);
        if (onContinueChat) {
          await onContinueChat();
        } else if (onBack) {
          onBack();
        }
      } else {
        const shortfall = Math.max(1, Math.ceil(required - balance));
        setContinueRechargeData({
          balance,
          required,
          rate: effectiveRate,
          shortfall
        });
        setContinueRechargeAmount(Math.max(shortfall, 50));
        setShowContinueRechargeModal(true);
        setIsCheckingBalance(false);
      }
    } catch (err) {
      console.error('Failed to check balance before continue chat:', err);
      setIsCheckingBalance(false);
      if (onContinueChat) {
        await onContinueChat();
      } else if (onBack) {
        onBack();
      }
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '400px', margin: '0 auto', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
      
      {error ? (
        <div style={{ background: '#13161C', borderRadius: '24px', padding: '48px 24px', border: '1px solid #1F2937' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '1.4rem' }}>
            {isFreeChat ? 'Free chat ended' : 'Chat Ended'}
          </h3>
          <p style={{ color: '#ef4444', marginBottom: '32px' }}>
            {error}
          </p>
          <button onClick={onBack} style={{ background: '#3BA8D8', color: '#fff', border: 'none', borderRadius: '100px', padding: '16px', fontWeight: '700', fontSize: '16px', width: '100%', cursor: 'pointer' }}>
            Return to Profile
          </button>
        </div>
      ) : showTipSelector ? (
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowTipSelector(false)}
            style={{ position: 'absolute', left: '-12px', top: '0', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', padding: '8px', zIndex: 10 }}
            title="Go Back"
          >
            ←
          </button>
          
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 16px' }}>
            {creator?.avatarUrl ? (
              <img 
                src={creator.avatarUrl.startsWith('http') ? creator.avatarUrl : `http://localhost:5000${creator.avatarUrl}`} 
                alt={creator?.name} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1F2937' }}
              />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: 'bold', border: '2px solid #1F2937' }}>
                {creator?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>

          <h2 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.5rem', fontWeight: '600' }}>
            Say Thank You
          </h2>
          <p style={{ color: '#94a3b8', margin: '0 0 32px 0', fontSize: '0.95rem' }}>
            Show your appreciation for {creator?.name}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[10, 20, 30, 40, 50].map((amount) => {
              const isSelected = selectedTip === amount || Number(customTip) === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setSelectedTip(amount);
                    setCustomTip(String(amount));
                  }}
                  style={{
                    background: isSelected ? 'rgba(59, 168, 216, 0.1)' : '#13161C',
                    border: isSelected ? '2px solid #3BA8D8' : '1px solid #374151',
                    color: isSelected ? '#3BA8D8' : '#fff',
                    borderRadius: '12px',
                    padding: '16px 0',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ₹{amount}
                </button>
              );
            })}
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}>₹</span>
              <input
                type="number"
                placeholder="Custom tip amount"
                value={customTip}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomTip(val);
                  const num = Number(val);
                  if ([10, 20, 30, 40, 50].includes(num)) {
                    setSelectedTip(num);
                  } else {
                    setSelectedTip(null);
                  }
                }}
                style={{
                  width: '100%',
                  background: '#13161C',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  padding: '16px 16px 16px 36px',
                  color: '#fff',
                  fontSize: '1.1rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3BA8D8'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              const amount = customTip ? Number(customTip) : selectedTip;
              if (amount && Number(amount) > 0) {
                try {
                  const res = await api.post('/wallet/tip', { creatorId: creator?._id || creator?.id, amount: Number(amount) });
                  if (res.data && res.data.success) {
                    setSuccessTipAmount(amount);
                    setShowTipSelector(false);
                  } else {
                    alert(res.data?.message || 'Failed to send tip');
                  }
                } catch (err) {
                  console.error(err);
                  const errorMsg = err.response?.data?.message || err.message || 'Error sending tip';
                  if (errorMsg === 'Insufficient balance') {
                    setShowInsufficientModal(true);
                  } else {
                    alert(errorMsg);
                  }
                }
              }
            }}
            disabled={!(Number(customTip) > 0 || Number(selectedTip) > 0)}
            style={{
              width: '100%',
              background: !(Number(customTip) > 0 || Number(selectedTip) > 0) ? '#374151' : '#10b981',
              color: !(Number(customTip) > 0 || Number(selectedTip) > 0) ? '#9ca3af' : '#fff',
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: !(Number(customTip) > 0 || Number(selectedTip) > 0) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Say Thank You
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <button 
            onClick={onBack}
            style={{ position: 'absolute', left: '-12px', top: '0', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', padding: '8px', zIndex: 10 }}
            title="Go Back"
          >
            ←
          </button>
          
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 16px' }}>
            {creator?.avatarUrl ? (
              <img 
                src={creator.avatarUrl.startsWith('http') ? creator.avatarUrl : `http://localhost:5000${creator.avatarUrl}`} 
                alt={creator?.name} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1F2937' }}
              />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: 'bold', border: '2px solid #1F2937' }}>
                {creator?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>

          <h2 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.5rem', fontWeight: '600' }}>
            {isFreeChat ? 'Free chat ended' : 'Chat ended'}
          </h2>
          <p style={{ color: '#94a3b8', margin: '0 0 24px 0', fontSize: '0.95rem' }}>
            with {creator?.name}
          </p>

          <div style={{ background: '#13161C', borderRadius: '16px', border: '1px solid #1F2937', padding: '16px 20px', marginBottom: '32px', textAlign: 'left' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px dashed #374151' }}>
              <span style={{ color: '#94a3b8' }}>Duration</span>
              <span style={{ color: '#fff', fontWeight: '500' }}>{durationText}</span>
            </div>
            

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Total spent</span>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{Number(totalCost).toFixed(2)}</span>
            </div>

          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.1rem', fontWeight: '500' }}>
              Rate your chat
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '32px',
                    color: (hoverRating || rating) >= star ? '#f43f5e' : '#374151',
                    transition: 'color 0.2s',
                    outline: 'none'
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    background: selectedTags.includes(tag) ? 'rgba(59, 168, 216, 0.1)' : 'transparent',
                    border: selectedTags.includes(tag) ? '1px solid #3BA8D8' : '1px solid #374151',
                    color: selectedTags.includes(tag) ? '#3BA8D8' : '#94a3b8',
                    borderRadius: '100px',
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience (optional)"
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                background: '#13161C',
                border: '1px solid #374151',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.95rem',
                minHeight: '80px',
                fontFamily: 'Inter, sans-serif',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3BA8D8'}
              onBlur={(e) => e.target.style.borderColor = '#374151'}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowTipSelector(true)}
              style={{
                flex: 1,
                background: '#13161C',
                color: '#fff',
                border: '1px solid #374151',
                borderRadius: '16px',
                padding: '16px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Say Thank You
            </button>
            <button
              onClick={handleContinueChatClick}
              disabled={isCheckingBalance}
              style={{
                flex: 1,
                background: '#f43f5e',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                padding: '16px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: isCheckingBalance ? 'not-allowed' : 'pointer',
                opacity: isCheckingBalance ? 0.8 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isCheckingBalance ? (
                <>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'chatEndSpin 1s linear infinite'
                  }} />
                  Checking...
                </>
              ) : (
                'Continue chat'
              )}
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button
              onClick={handleDone}
              style={{
                width: '100%',
                background: '#13161C',
                color: '#fff',
                border: '1px solid #374151',
                borderRadius: '16px',
                padding: '16px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.background = '#1F2937'}
              onMouseLeave={(e) => e.target.style.background = '#13161C'}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Style for button spinner */}
      <style>{`
        @keyframes chatEndSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Insufficient Balance / Recharge Modal for Continuing Chat */}
      {showContinueRechargeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#13161C', borderRadius: '24px', padding: '28px 24px',
            width: '100%', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            border: '1px solid #1F2937',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowContinueRechargeModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'transparent', border: 'none', color: '#94a3b8',
                fontSize: '20px', cursor: 'pointer', padding: '4px', lineHeight: 1
              }}
            >
              ✕
            </button>

            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', margin: '0 auto 16px'
            }}>
              💳
            </div>

            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', margin: '0 0 8px 0' }}>
              Recharge to Continue Chat
            </h3>

            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              You need at least <strong>5 minutes</strong> of chat balance to continue chatting with <span style={{ color: '#fff' }}>{creator?.name || 'this creator'}</span>.
            </p>

            {/* Breakdown card */}
            <div style={{
              background: '#0D0F14', borderRadius: '16px', border: '1px solid #1F2937',
              padding: '14px 16px', marginBottom: '20px', textAlign: 'left', fontSize: '13.5px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Rate per minute</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>₹{continueRechargeData.rate}/min</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Required for 5 mins</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>₹{continueRechargeData.required}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Current Wallet Balance</span>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>₹{Number(continueRechargeData.balance).toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', paddingTop: '8px',
                borderTop: '1px dashed #2d3748', marginTop: '4px'
              }}>
                <span style={{ color: '#f43f5e', fontWeight: '600' }}>Shortfall</span>
                <span style={{ color: '#f43f5e', fontWeight: '700', fontSize: '15px' }}>₹{continueRechargeData.shortfall}</span>
              </div>
            </div>

            {/* Preset Amount buttons */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'left', marginBottom: '8px', fontWeight: '500' }}>
                Select recharge amount:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  continueRechargeData.shortfall > 0 ? continueRechargeData.shortfall : 50,
                  50, 100, 200
                ].filter((v, idx, arr) => arr.indexOf(v) === idx).slice(0, 4).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setContinueRechargeAmount(amt)}
                    style={{
                      background: continueRechargeAmount === amt ? 'rgba(59, 168, 216, 0.15)' : '#0D0F14',
                      border: continueRechargeAmount === amt ? '2px solid #3BA8D8' : '1px solid #1F2937',
                      color: continueRechargeAmount === amt ? '#3BA8D8' : '#fff',
                      borderRadius: '12px',
                      padding: '10px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount input */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>₹</span>
              <input
                type="number"
                min={continueRechargeData.shortfall}
                value={continueRechargeAmount}
                onChange={(e) => setContinueRechargeAmount(Math.max(1, Number(e.target.value)))}
                placeholder="Custom recharge amount"
                style={{
                  width: '100%',
                  background: '#0D0F14',
                  border: '1px solid #1F2937',
                  borderRadius: '12px',
                  padding: '12px 14px 12px 30px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3BA8D8'}
                onBlur={(e) => e.target.style.borderColor = '#1F2937'}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <WalletPaymentButton
                amount={continueRechargeAmount}
                onSuccess={async (newBalance) => {
                  setShowContinueRechargeModal(false);
                  if (onContinueChat) {
                    await onContinueChat();
                  }
                }}
                customStyle={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(244, 63, 94, 0.4)',
                  transition: 'transform 0.1s'
                }}
                customText={`Recharge ₹${continueRechargeAmount} & Continue Chat`}
              />

              <button
                type="button"
                onClick={() => setShowContinueRechargeModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '14px',
                  padding: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showInsufficientModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1a1a', borderRadius: '24px', padding: '32px',
            width: '90%', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
            <h3 style={{ color: '#fff', fontSize: '24px', margin: '0 0 12px 0' }}>Insufficient Balance</h3>
            <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
              Your wallet balance is too low to send this tip. Please recharge your wallet to continue supporting this creator.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowInsufficientModal(false)}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <div style={{ flex: 1 }}>
                <WalletPaymentButton
                  amount={customTip ? Number(customTip) : selectedTip}
                  onSuccess={async () => {
                    try {
                      const amount = customTip ? Number(customTip) : selectedTip;
                      const res = await api.post('/wallet/tip', { creatorId: creator?._id || creator?.id, amount: Number(amount) });
                      if (res.data && res.data.success) {
                        setSuccessTipAmount(amount);
                        setShowTipSelector(false);
                        setShowInsufficientModal(false);
                      } else {
                        alert(res.data?.message || 'Failed to send tip after recharge');
                      }
                    } catch (err) {
                      console.error(err);
                      alert(err.response?.data?.message || 'Error sending tip after recharge');
                    }
                  }}
                  customStyle={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: '#10b981', border: 'none',
                    color: '#fff', fontWeight: '600', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  customText={`Pay ₹${selectedTip || customTip} via Razorpay`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {successTipAmount && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1a1a', borderRadius: '24px', padding: '32px',
            width: '90%', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ color: '#fff', fontSize: '24px', margin: '0 0 12px 0' }}>Thank You Sent!</h3>
            <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              You’ve successfully sent a thank you to {creator?.name || 'the creator'}.
              <br />
              It’s a small gesture that means a lot. 🩵
            </p>
            <button
              onClick={() => setSuccessTipAmount(null)}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: '#10b981', border: 'none',
                color: '#fff', fontWeight: '600', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              Awesome
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatEndScreen;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockCreator } from '../../mock/questions';
import { linkBank } from '../../services/creatorApi';

const InputCard = ({ label, value, onChange, placeholder, type = 'text' }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      background: '#1A1A1A',
      border: focused ? '1px solid #29C5F6' : '1px solid #2A2A2A',
      borderRadius: '16px',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      transition: 'border 0.2s ease'
    }}>
      <label style={{ 
        fontSize: '0.65rem', 
        color: '#64748b', 
        fontWeight: 700, 
        letterSpacing: '1.2px', 
        textTransform: 'uppercase' 
      }}>
        {label.replace('*', '').trim()} {label.includes('*') && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="payout-input"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          fontSize: '1.1rem',
          fontWeight: '600',
          outline: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          width: '100%'
        }}
      />
    </div>
  );
};

const CreatorPayouts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creator = location.state?.creator || mockCreator;

  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [panNumber, setPanNumber] = useState('');

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'INBOX', icon: '💬', route: '/creator/inbox' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
    { label: 'PAYOUTS', icon: '💰', route: '/creator/payouts' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  // Cyan filter: to make emojis turn cyan #29C5F6
  const cyanFilter = 'invert(69%) sepia(87%) saturate(2714%) hue-rotate(164deg) brightness(99%) contrast(98%)';
  // Gray filter
  const grayFilter = 'invert(31%) sepia(13%) saturate(760%) hue-rotate(181deg) brightness(96%) contrast(85%)';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0E0E0E',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
        .payout-input::placeholder {
          font-style: italic;
          color: #475569;
          font-weight: 500;
        }
      `}} />
      
      {/* Container to restrict width */}
      <div style={{
        width: '100%',
        maxWidth: '390px',
        padding: '24px 20px 120px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Header Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '4px'
        }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/creator/dashboard')}
            style={{
              position: 'absolute',
              left: 0,
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              color: '#ffffff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '22px',
              fontWeight: '300',
              transition: 'background-color 0.2s',
              paddingBottom: '2px' // optical alignment for chevron
            }}
            onMouseEnter={(e) => e.target.style.background = '#2A2A2A'}
            onMouseLeave={(e) => e.target.style.background = '#1A1A1A'}
          >
            ‹
          </button>
          
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            margin: 0,
            color: '#ffffff',
            letterSpacing: '-0.02em'
          }}>
            Payout setup
          </h2>
        </div>

        {/* Progress Bar Card */}
        <div style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, letterSpacing: '1.2px' }}>
              STEP 2 OF 2 — PAYOUT SETUP
            </span>
            <span style={{ fontSize: '0.75rem', color: '#29C5F6', fontWeight: 600 }}>
              Almost done
            </span>
          </div>
          <div style={{ width: '100%', height: '4px', background: '#2A2A2A', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '90%', height: '100%', background: '#29C5F6', borderRadius: '2px' }} />
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          background: 'rgba(41, 197, 246, 0.05)',
          border: '1px solid rgba(41, 197, 246, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{ 
            width: '14px', 
            height: '14px', 
            borderRadius: '50%', 
            border: '1.5px solid #29C5F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '3px'
          }}>
            <div style={{ width: '4px', height: '4px', background: '#29C5F6', borderRadius: '50%' }} />
          </div>
          <p style={{
            margin: 0,
            fontSize: '0.95rem',
            color: '#94a3b8',
            lineHeight: '1.5',
            letterSpacing: '-0.01em'
          }}>
            Your bank details are needed to release your Tuesday payouts via RazorpayX. Your page goes live immediately — payouts start next Tuesday.
          </p>
        </div>

        {/* Bank Account Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            Bank account
          </h3>
          
          <InputCard 
            label="ACCOUNT HOLDER NAME *" 
            value={accountName} 
            onChange={setAccountName} 
            placeholder="Name on bank account"
          />
          
          <InputCard 
            label="ACCOUNT NUMBER *" 
            value={accountNumber} 
            onChange={setAccountNumber} 
            placeholder="Account number"
          />

          <InputCard 
            label="RE-ENTER ACCOUNT NUMBER *" 
            value={confirmAccount} 
            onChange={setConfirmAccount} 
            placeholder="Confirm account number"
          />
          
          <InputCard 
            label="IFSC CODE *" 
            value={ifsc} 
            onChange={setIfsc} 
            placeholder="e.g. HDFC0001234"
          />


        </div>

        {/* PAN Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            PAN number <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>for TDS compliance</span>
          </h3>
          
          <InputCard 
            label="PAN NUMBER" 
            value={panNumber} 
            onChange={setPanNumber} 
            placeholder="e.g. ABCDE1234F"
          />

          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            color: '#64748b',
            lineHeight: '1.5',
            padding: '0 4px'
          }}>
            Required only if you earn above ₹5 lakh/year. We deduct 1% TDS as per Section 194-O and file on your behalf.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <button
            onClick={async () => {
              if (!accountName.trim() || !accountNumber.trim() || !confirmAccount.trim() || !ifsc.trim()) {
                alert('Please fill out all mandatory fields (marked with a red asterisk) before going live.');
                return;
              }
              if (accountNumber !== confirmAccount && !accountNumber.includes('·')) {
                alert('Account numbers do not match.');
                return;
              }
              try {
                await linkBank();
                navigate('/creator/dashboard');
              } catch (error) {
                console.error('Failed to link bank:', error);
                alert('Failed to link bank account. Please try again.');
              }
            }}
            style={{
              background: '#29C5F6',
              color: '#0E0E0E',
              border: 'none',
              borderRadius: '16px',
              padding: '18px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              width: '100%'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Save & go live — view my page →
          </button>

          <button
            onClick={() => navigate('/creator/dashboard')}
            style={{
              background: 'transparent',
              color: '#29C5F6',
              border: '1px solid #29C5F6',
              borderRadius: '16px',
              padding: '18px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              width: '100%'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(41, 197, 246, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Skip for now — remind me in 7 days
          </button>
        </div>

        {/* Footer Note */}
        <div style={{ 
          textAlign: 'center', 
          color: '#475569', 
          fontSize: '0.75rem', 
          fontFamily: 'monospace',
          letterSpacing: '0.5px',
          marginTop: '8px'
        }}>
          256-bit encrypted · Powered by Razorpay
        </div>

      </div>

      {/* 5. BOTTOM NAV BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '390px',
        background: '#0E0E0E',
        borderTop: '1px solid #1A1A1A',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0 20px',
        zIndex: 100
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <div
              key={item.route}
              onClick={() => navigate(item.route)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                color: isActive ? '#29C5F6' : '#64748b',
                fontSize: '0.6rem',
                letterSpacing: '1px',
                fontWeight: 'bold',
                gap: '6px'
              }}
            >
              <span style={{ 
                fontSize: '20px',
                filter: isActive ? cyanFilter : grayFilter
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default CreatorPayouts;

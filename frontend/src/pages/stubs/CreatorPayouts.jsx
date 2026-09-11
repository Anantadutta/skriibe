import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockCreator } from '../../mock/questions';
import { getMe, linkBank, savePayoutDetails, toggleLive, verifyIfsc } from '../../services/creatorApi';

const InputCard = ({ label, value, onChange, placeholder, type = 'text', isUppercase = false, onBlur, error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
    <div style={{
      background: '#1A1A1A',
      border: error ? '1px solid #EF4444' : (focused ? '1px solid #29C5F6' : '1px solid #2A2A2A'),
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
        onBlur={(e) => {
          setFocused(false);
          if (onBlur) onBlur(e);
        }}
        className="payout-input"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          fontSize: '1.1rem',
          fontWeight: '600',
          outline: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          width: '100%',
          textTransform: isUppercase ? 'uppercase' : 'none'
        }}
      />
    </div>
    {error && <div style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '6px', paddingLeft: '8px', fontWeight: 600 }}>{error}</div>}
    </div>
  );
};

const CreatorPayouts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCreator = location.state?.creator || mockCreator;
  const [creator, setCreator] = useState(initialCreator);

  const [accountName, setAccountName] = useState(initialCreator.bankAccountName || '');
  const [accountNumber, setAccountNumber] = useState(initialCreator.bankAccountNumber || '');
  const [confirmAccount, setConfirmAccount] = useState(initialCreator.bankAccountNumber || '');
  const [ifsc, setIfsc] = useState(initialCreator.bankIfsc || '');
  const [ifscError, setIfscError] = useState('');
  const [panNumber, setPanNumber] = useState(initialCreator.panNumber || initialCreator.pan || '');
  const [phone, setPhone] = useState(initialCreator.phone || '');
  
  // Payout method state
  const [payoutMethod, setPayoutMethod] = useState(
    initialCreator.payoutMethod || (initialCreator.bankAccountNumber && !initialCreator.upiId ? 'bank' : 'upi')
  );
  const [upiId, setUpiId] = useState(initialCreator.upiId || '');
  const [aadharLast4, setAadharLast4] = useState(initialCreator.aadharLast4 || '');
  const [confirmed, setConfirmed] = useState(
    Boolean(initialCreator.payoutDetailsConfirmed || initialCreator.payoutSetupCompleted || initialCreator.panNumber)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;
    const fetchCreator = async () => {
      try {
        const res = await getMe();
        if (res.success && res.creator && isMounted) {
          const c = res.creator;
          setCreator(c);
          setAccountName(c.bankAccountName || '');
          setAccountNumber(c.bankAccountNumber || '');
          setConfirmAccount(c.bankAccountNumber || '');
          setIfsc(c.bankIfsc || '');
          setPanNumber(c.panNumber || c.pan || '');
          setPhone(c.phone || '');
          setAadharLast4(c.aadharLast4 || '');
          setUpiId(c.upiId || '');
          if (c.payoutMethod) {
            setPayoutMethod(c.payoutMethod);
          } else if (c.bankAccountNumber && !c.upiId) {
            setPayoutMethod('bank');
          } else {
            setPayoutMethod('upi');
          }
          if (c.payoutDetailsConfirmed || c.payoutSetupCompleted || c.panNumber || c.bankLinked) {
            setConfirmed(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch creator in payout setup:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchCreator();
    return () => { isMounted = false; };
  }, []);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'CHATS', icon: '💬', route: '/creator/inbox' },
    { label: 'TRANSACTIONS', icon: '💰', route: '/creator/payouts' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

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
              paddingBottom: '2px'
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
            Identity check
          </h2>
        </div>

        {/* Info Box - dynamic status */}
        {(() => {
          const isSetupCompleted = Boolean(
            creator.payoutSetupCompleted || 
            (creator.panNumber && (creator.upiId || (creator.bankAccountNumber && creator.bankIfsc)))
          );

          return (
            <div style={{
              background: '#1A1A1A',
              border: isSetupCompleted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   {isSetupCompleted && <span style={{ color: '#22c55e' }}>✓</span>}
                   {isSetupCompleted ? 'Payout details active' : 'Not started yet'}
                 </h3>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                   {isSetupCompleted 
                     ? (payoutMethod === 'upi' 
                         ? `Payouts are active via UPI (${upiId || creator.upiId || 'configured'}).` 
                         : `Payouts are active to bank account ending in ••••${(accountNumber || creator.bankAccountNumber || '').slice(-4)}.`
                       )
                     : 'Your earnings are safe either way — this is only needed to pay them out.'}
                 </p>
              </div>
              <div style={{ 
                background: isSetupCompleted ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)', 
                color: isSetupCompleted ? '#22c55e' : '#f59e0b', 
                border: isSetupCompleted ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                padding: '4px 10px', 
                borderRadius: '12px', 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                whiteSpace: 'nowrap' 
              }}>
                 {isSetupCompleted ? 'Active' : 'Not started'}
              </div>
            </div>
          );
        })()}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <InputCard 
            label="PAN *" 
            value={panNumber} 
            onChange={(val) => setPanNumber(val.toUpperCase())} 
            placeholder="e.g. ABCDE1234F"
            isUppercase={true}
          />
          
          <div>
            <InputCard 
              label="LAST 4 DIGITS OF AADHAAR *" 
              value={aadharLast4} 
              onChange={(val) => {
                if (val.length <= 4 && /^\d*$/.test(val)) {
                  setAadharLast4(val);
                }
              }} 
              placeholder="1234"
            />
            <p style={{
              margin: 0,
              fontSize: '0.75rem',
              color: '#64748b',
              lineHeight: '1.5',
              padding: '0 4px',
              marginTop: '6px'
            }}>
              Only the last four — we never ask for the full number.
            </p>
          </div>
        </div>

        {/* WHERE SHOULD WE PAY YOU */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: '#64748b', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            WHERE SHOULD WE PAY YOU
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPayoutMethod('upi')}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                background: payoutMethod === 'upi' ? '#132b35' : '#1A1A1A',
                color: payoutMethod === 'upi' ? '#29C5F6' : '#ffffff',
                border: payoutMethod === 'upi' ? '1px solid #29C5F6' : '1px solid #2A2A2A',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              UPI
            </button>
            <button
              onClick={() => setPayoutMethod('bank')}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                background: payoutMethod === 'bank' ? '#132b35' : '#1A1A1A',
                color: payoutMethod === 'bank' ? '#29C5F6' : '#ffffff',
                border: payoutMethod === 'bank' ? '1px solid #29C5F6' : '1px solid #2A2A2A',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Bank account
            </button>
          </div>
        </div>

        {payoutMethod === 'upi' ? (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <InputCard 
               label="UPI ID *" 
               value={upiId} 
               onChange={setUpiId} 
               placeholder="you@okaxis"
             />
           </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            {confirmAccount && accountNumber !== confirmAccount && (
              <div style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '-8px', paddingLeft: '8px', fontWeight: 600 }}>
                Account numbers do not match
              </div>
            )}
            
            <InputCard 
              label="IFSC CODE *" 
              value={ifsc} 
              isUppercase={true}
              onChange={(val) => {
                setIfsc(val.toUpperCase());
                if (ifscError) setIfscError('');
              }} 
              placeholder="e.g. HDFC0001234"
              onBlur={async () => {
                if (ifsc.trim()) {
                  try {
                    const res = await verifyIfsc(ifsc.trim().toUpperCase());
                    if (!res.data || !res.data.verified) {
                      setIfscError(res.data?.reason || 'Invalid IFSC code');
                    } else {
                      setIfscError('');
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }
              }}
              error={ifscError}
            />
          </div>
        )}

        {/* Checkbox at the end */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginTop: '8px' }}>
          <div style={{ marginTop: '2px', position: 'relative', width: '20px', height: '20px', flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{
                width: '100%',
                height: '100%',
                opacity: 0,
                position: 'absolute',
                zIndex: 2,
                cursor: 'pointer'
              }}
            />
            <div style={{
              width: '100%',
              height: '100%',
              border: confirmed ? 'none' : '1px solid #64748b',
              borderRadius: '6px',
              background: confirmed ? '#29C5F6' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}>
              {confirmed && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
          </div>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', flex: 1 }}>
            I confirm these are my own details, that I'm 18 or older, and that I own the rights to everything I publish.
          </span>
        </label>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <button
            disabled={isSaving}
            onClick={async () => {
              if (isSaving) return;

              const isUpiMethod = payoutMethod === 'upi';
              const isBankMethod = payoutMethod === 'bank';

              if (!panNumber.trim()) {
                setErrorMessage('Please enter your PAN number.');
                setShowErrorModal(true);
                return;
              }

              const formattedPan = panNumber.trim().toUpperCase();
              const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
              if (!panRegex.test(formattedPan)) {
                setErrorMessage('Please enter a valid PAN number format (e.g. ABCDE1234F).');
                setShowErrorModal(true);
                return;
              }

              const formattedAadhar = aadharLast4.trim();
              if (!/^\d{4}$/.test(formattedAadhar)) {
                setErrorMessage('Please enter exactly the last 4 digits of your Aadhaar number.');
                setShowErrorModal(true);
                return;
              }

              if (isUpiMethod) {
                const trimmedUpi = upiId.trim();
                if (!trimmedUpi || !trimmedUpi.includes('@')) {
                  setErrorMessage('Please enter a valid UPI ID (e.g. you@okaxis).');
                  setShowErrorModal(true);
                  return;
                }
              }

              if (isBankMethod) {
                if (!accountName.trim()) {
                  setErrorMessage('Please enter the account holder name.');
                  setShowErrorModal(true);
                  return;
                }
                if (!accountNumber.trim()) {
                  setErrorMessage('Please enter your bank account number.');
                  setShowErrorModal(true);
                  return;
                }
                if (accountNumber.trim() !== confirmAccount.trim()) {
                  setErrorMessage('Bank account numbers do not match.');
                  setShowErrorModal(true);
                  return;
                }
                if (!ifsc.trim()) {
                  setErrorMessage('Please enter your bank IFSC code.');
                  setShowErrorModal(true);
                  return;
                }
                try {
                  const ifscRes = await verifyIfsc(ifsc.trim().toUpperCase());
                  if (!ifscRes.data || !ifscRes.data.verified) {
                    setIfscError(ifscRes.data?.reason || 'Invalid IFSC code');
                    setErrorMessage(ifscRes.data?.reason || 'Please enter a valid IFSC code.');
                    setShowErrorModal(true);
                    return;
                  } else {
                    setIfscError('');
                  }
                } catch (err) {
                  console.error('IFSC Verification failed during submit:', err);
                  setErrorMessage('Could not verify IFSC. Please try again.');
                  setShowErrorModal(true);
                  return;
                }
              }

              if (!confirmed) {
                setErrorMessage('Please confirm that these are your own details.');
                setShowErrorModal(true);
                return;
              }

              try {
                setIsSaving(true);
                const payload = {
                  pan: formattedPan,
                  aadharLast4: formattedAadhar,
                  payoutMethod,
                  upiId: isUpiMethod ? upiId.trim() : undefined,
                  bankAccountName: isBankMethod ? accountName.trim() : undefined,
                  bankAccountNumber: isBankMethod ? accountNumber.trim() : undefined,
                  bankIfsc: isBankMethod ? ifsc.trim().toUpperCase() : undefined,
                  confirmed: true
                };

                const res = await savePayoutDetails(payload);
                if (res.data?.creator) {
                  setCreator(res.data.creator);
                }
                localStorage.setItem('bankLinked', 'true');
                await toggleLive(true);
                navigate('/creator/dashboard', { state: { creator: res.data?.creator } });
              } catch (error) {
                console.error('Failed to link payouts:', error);
                const serverMsg = error?.response?.data?.message || 'Failed to link payout details. Please try again.';
                setErrorMessage(serverMsg);
                setShowErrorModal(true);
              } finally {
                setIsSaving(false);
              }
            }}
            style={{
              background: isSaving ? '#1a7590' : '#29C5F6',
              color: '#0E0E0E',
              border: 'none',
              borderRadius: '16px',
              padding: '18px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              width: '100%',
              opacity: isSaving ? 0.7 : 1
            }}
            onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {isSaving ? 'Saving details...' : 'Save & Go To Dashboard  →'}
          </button>

          {(!accountName && !accountNumber && !ifsc && !panNumber && !upiId && !aadharLast4) && (
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
              Skip for now
            </button>
          )}
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
        left: 0,
        right: 0,
        margin: '0 auto',
        width: '100%',
        maxWidth: '390px',
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
                fontSize: '20px'
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Custom Error Modal */}
      {showErrorModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1c1613',
            border: '1px solid #332b26',
            borderRadius: '16px',
            padding: '24px',
            width: '85%',
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  background: '#fbb142',
                  border: 'none',
                  color: '#0e0e0e',
                  borderRadius: '24px',
                  padding: '8px 24px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 0 2px #1c1613, 0 0 0 4px #fbb142',
                  marginRight: '4px'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreatorPayouts;

import React, { useState } from 'react';
import WalletPaymentButton from './WalletPaymentButton';

const InChatRechargeModal = ({ creatorName, statsMinutes, onCancel, onClose, isManual, isFreeChatEnded, onRechargeSuccess }) => {
  const presets = [1, 50, 100, 200, 500];
  const [selectedAmount, setSelectedAmount] = useState(100);

  return (
    <div style={{
      width: '100%',
      background: '#fff',
      borderTopLeftRadius: '24px',
      borderTopRightRadius: '24px',
      padding: '16px 24px 32px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: 'auto',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      fontFamily: '"Nunito", "Quicksand", "Comic Sans MS", system-ui, sans-serif',
      color: '#111',
      position: 'relative'
    }}>
      {isManual && onClose && (
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '20px', background: 'transparent', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}
        >
          ×
        </button>
      )}
      {/* Grab Handle */}
      <div style={{ width: '40px', height: '4px', background: '#d1d5db', borderRadius: '2px', marginBottom: '16px' }} />

      {/* Icon */}
      <div style={{ fontSize: '36px', marginBottom: '8px' }}>
        ⏳
      </div>

      {/* Title */}
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>
        {isFreeChatEnded ? 'Free chat ended' : (isManual ? 'Top up wallet' : "Time's up!")}
      </h2>

      {/* Subtitle */}
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px 0', textAlign: 'center' }}>
        {isFreeChatEnded ? `Top up your wallet to continue chatting with ${creatorName}` : (isManual ? `Recharge now to chat longer with ${creatorName}` : `Wallet empty - you chatted ${Math.floor(statsMinutes || 0)} min with ${creatorName}`)}
      </p>

      {/* Amount Presets */}
      <div style={{ display: 'flex', gap: '12px', width: '100%', marginBottom: '24px', justifyContent: 'center' }}>
        {presets.map(amount => (
          <button
            key={amount}
            onClick={() => setSelectedAmount(amount)}
            style={{
              flex: 1,
              background: '#fff',
              border: selectedAmount === amount ? '2px solid #FF5B71' : '1px solid #d1d5db',
              borderRadius: '24px',
              padding: '12px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#111',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            ₹{amount}
          </button>
        ))}
      </div>

      {/* Submit Button Wrapper */}
      <div style={{ width: '100%', marginBottom: '16px' }}>
        <WalletPaymentButton 
          amount={selectedAmount}
          onSuccess={onRechargeSuccess}
          customStyle={{
            background: '#FF5B71',
            color: '#fff',
            border: '2px solid #111',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%',
            cursor: 'pointer',
            transition: 'transform 0.1s',
            boxShadow: '0 2px 0 #111'
          }}
          customText="Top up & keep chatting"
        />
      </div>

      {/* Cancel Link */}
      {!isManual && (
        <button 
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            textDecoration: 'underline',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          End chat
        </button>
      )}
    </div>
  );
};

export default InChatRechargeModal;

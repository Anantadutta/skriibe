import React, { useState } from 'react';
import WalletPaymentButton from './WalletPaymentButton';

const RechargeModal = ({ isOpen, onClose, onRechargeSuccess }) => {
  const [selectedAmount, setSelectedAmount] = useState(500);

  if (!isOpen) return null;

  const amounts = [100, 500, 1000, 2000];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#13161C',
        border: '1px solid #1F2937',
        borderRadius: '24px',
        padding: '32px',
        width: '90%',
        maxWidth: '400px',
        color: '#fff',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}
        >×</button>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Top Up Wallet</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Add funds to start a live chat.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {amounts.map(amt => (
            <button
              key={amt}
              onClick={() => setSelectedAmount(amt)}
              style={{
                background: selectedAmount === amt ? 'rgba(59, 168, 216, 0.1)' : '#0a0a0f',
                border: selectedAmount === amt ? '1px solid #3BA8D8' : '1px solid #1F2937',
                borderRadius: '12px',
                padding: '16px',
                color: selectedAmount === amt ? '#3BA8D8' : '#fff',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        <WalletPaymentButton 
          amount={selectedAmount} 
          onSuccess={(newBalance) => {
            onRechargeSuccess(newBalance);
            onClose();
          }} 
        />
      </div>
    </div>
  );
};

export default RechargeModal;

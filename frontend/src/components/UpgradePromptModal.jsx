import React from 'react';
import { useNavigate } from 'react-router-dom';

const UpgradePromptModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#13161C',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '380px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
        
        <h2 style={{
          color: '#ffffff',
          fontSize: '22px',
          fontWeight: '700',
          marginBottom: '12px',
          fontFamily: 'var(--font-heading)'
        }}>
          Start answering paid questions from your audience
        </h2>
        
        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          lineHeight: '1.5',
          marginBottom: '32px'
        }}>
          Upgrade to a Creator account — it only takes a minute. Your fan account stays exactly as it is.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => {
              onClose();
              navigate('/fan/upgrade');
            }}
            style={{
              background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '14px',
              borderRadius: '999px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            Become a Creator
          </button>
          
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              border: 'none',
              padding: '14px',
              borderRadius: '999px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePromptModal;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const PreChatScreen = ({ creator, walletBalance, rate, onRecharge, onRequestChat }) => {
  const navigate = useNavigate();
  const affordableMinutes = Math.floor(walletBalance / rate);
  const canAfford = affordableMinutes > 0;

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate(`/${creator?.handle}`)}
          style={{ background: '#1F2937', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}
        >
          ←
        </button>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>Live Chat Request</h2>
      </div>

      <div style={{ background: '#13161C', borderRadius: '24px', padding: '24px', border: '1px solid #1F2937' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          {creator?.avatarUrl ? (
            <img 
              src={creator.avatarUrl.startsWith('http') ? creator.avatarUrl : `http://localhost:5000${creator.avatarUrl}`} 
              alt={creator?.name} 
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
              {creator?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{creator?.name}</h3>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>@{creator?.handle}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0a0a0f', borderRadius: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Creator's Rate</div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{rate}/min</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Your Balance</div>
            <div style={{ color: canAfford ? '#22c55e' : '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{walletBalance}</div>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'rgba(59, 168, 216, 0.1)', border: '1px solid rgba(59, 168, 216, 0.3)', borderRadius: '16px', marginBottom: '24px' }}>
          <h4 style={{ color: '#3BA8D8', margin: '0 0 8px 0', fontSize: '0.95rem' }}>Estimated Chat Time</h4>
          {canAfford ? (
            <div style={{ color: '#fff' }}>Your balance covers approx. <strong style={{ color: '#3BA8D8' }}>{affordableMinutes} minutes</strong> of live chat.</div>
          ) : (
            <div style={{ color: '#ef4444' }}>You don't have enough balance to chat for even 1 minute. Please top up your wallet.</div>
          )}
        </div>

        <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ color: '#fb923c' }}>ℹ️</span> Billing only starts once {creator?.name} accepts your request.
        </div>

        {canAfford ? (
          <button
            onClick={onRequestChat}
            style={{
              background: 'linear-gradient(90deg, #3BA8D8, #1a6a9a)',
              color: '#fff',
              border: 'none',
              borderRadius: '100px',
              padding: '16px',
              fontWeight: '700',
              fontSize: '16px',
              width: '100%',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 168, 216, 0.3)'
            }}
          >
            Request Live Chat
          </button>
        ) : (
          <button
            onClick={onRecharge}
            style={{
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '100px',
              padding: '16px',
              fontWeight: '700',
              fontSize: '16px',
              width: '100%',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)'
            }}
          >
            Top Up Wallet
          </button>
        )}
        
      </div>
    </div>
  );
};

export default PreChatScreen;

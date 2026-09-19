import React, { useState } from 'react';
import WalletPaymentButton from './WalletPaymentButton';

const WalletRechargeScreen = ({ rate, onCancel, onRechargeSuccess, balance = 0, transactions = [] }) => {
  const presets = [1, 50, 100, 200, 500, 1000, 2000];
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [showAllTransactions, setShowAllTransactions] = useState(false);


  return (
    <div style={{ 
      padding: '40px 24px', 
      maxWidth: '600px', 
      margin: '0 auto', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      background: '#0a0a0f',
      color: '#fff'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-element {
          0% { transform: translateY(0px) rotate(0deg) scale(1); filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.4)); }
          50% { transform: translateY(-8px) rotate(5deg) scale(1.05); filter: drop-shadow(0 0 20px rgba(252, 211, 77, 0.8)); }
          100% { transform: translateY(0px) rotate(0deg) scale(1); filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.4)); }
        }
        @keyframes float-bg {
          0% { transform: translateY(0px) rotate(-15deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
          100% { transform: translateY(0px) rotate(-15deg); }
        }
      `}} />
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button 
          onClick={onCancel}
          style={{ background: 'transparent', color: '#94a3b8', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0' }}
        >
          ←
        </button>
      </div>

      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(6, 182, 212, 0.2)'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '10px',
          opacity: 0.15,
          pointerEvents: 'none',
          animation: 'float-bg 8s ease-in-out infinite'
        }}>
          <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
            <path d="M7 15h.01"></path>
            <path d="M11 15h2"></path>
          </svg>
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '12px', zIndex: 1, position: 'relative' }}>
          WALLET BALANCE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', zIndex: 1, position: 'relative' }}>
          <div style={{ animation: 'float-element 3s ease-in-out infinite' }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="url(#wallet-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="wallet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2" fill="rgba(236, 72, 153, 0.15)"></rect>
              <line x1="2" y1="10" x2="22" y2="10" stroke="#EC4899"></line>
              <path d="M7 15h.01" stroke="#FCD34D" strokeWidth="3"></path>
              <path d="M11 15h2" stroke="#8B5CF6" strokeWidth="3"></path>
            </svg>
          </div>
          <span style={{ color: '#fff', fontSize: '48px', fontWeight: '800', lineHeight: 1 }}>₹{Math.round(balance * 100) / 100}</span>
        </div>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>Add Money to Wallet</h1>
      <p style={{ color: '#94a3b8', marginBottom: '40px', textAlign: 'center' }}>
        Please top up your wallet to start the chat.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px', 
        width: '100%', 
        marginBottom: '40px' 
      }}>
        {presets.map(amount => (
          <div 
            key={amount} 
            onClick={() => setSelectedAmount(amount)}
            style={{ 
              position: 'relative',
              background: selectedAmount === amount ? 'rgba(56, 189, 248, 0.1)' : '#131313', 
              border: selectedAmount === amount ? '2px solid #38BDF8' : '1px solid #1f1f1f', 
              borderRadius: '16px', 
              padding: '28px 8px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedAmount === amount ? '0 4px 12px rgba(56, 189, 248, 0.15)' : 'none'
            }}
          >
            {amount === 500 && (
              <div style={{
                position: 'absolute',
                top: 0,
                background: '#38BDF8',
                color: '#000',
                fontSize: '10px',
                fontWeight: '800',
                padding: '4px 12px',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>★</span> Most Popular
              </div>
            )}
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>
              ₹{amount}
            </div>

          </div>
        ))}
      </div>

      <div style={{ width: '100%' }}>
        <WalletPaymentButton 
          amount={selectedAmount}
          onSuccess={onRechargeSuccess}
        />
      </div>

      <div style={{ width: '100%', marginTop: '48px' }}>
        <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '800', letterSpacing: '2px', marginBottom: '16px' }}>
          TRANSACTIONS
        </div>
        
        {transactions.length === 0 ? (
          <div style={{ 
            background: '#131313', 
            borderRadius: '16px', 
            padding: '32px 16px', 
            textAlign: 'center',
            color: '#64748b',
            fontSize: '14px'
          }}>
            No transactions yet.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(showAllTransactions ? transactions : transactions.slice(0, 3)).map(tx => {
                const desc = tx.description?.toLowerCase() || '';
                const isTip = desc.includes('tip');
                const isChat = desc.includes('chat');
                const isTopup = desc.includes('top-up');
                const isAma = desc.includes('ama') || desc.includes('question');
                
                let icon = '💳';
                let title = tx.description || 'Transaction';
                if (isTip) {
                  icon = '⭐';
                  title = tx.creatorId?.name ? `Tip • ${tx.creatorId.name}` : (tx.description || 'Tip');
                } else if (isChat || tx.sessionId) {
                  icon = '💬';
                  title = tx.creatorId?.name ? `Live chat • ${tx.creatorId.name}` : (tx.description || 'Live chat');
                } else if (isAma) {
                  icon = '❓';
                  title = tx.creatorId?.name ? `AMA • ${tx.creatorId.name}` : (tx.description || 'AMA');
                } else if (isTopup) {
                  icon = '💰';
                  title = 'Wallet Top-up';
                }

                const amount = tx.amount || tx.totalCost || 0;
                const isDebit = tx.type === 'debit' || isTip || isChat || isAma || tx.sessionId;
                const sign = isDebit ? '-' : '+';
                const amountColor = isDebit ? '#94a3b8' : '#10b981';

                return (
                <div key={tx._id || tx.sessionId || Math.random()} style={{ 
                  background: '#131313', 
                  borderRadius: '16px', 
                  padding: '16px', 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      background: isDebit ? 'rgba(56, 189, 248, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>
                        {title}
                      </div>
                      {(tx.createdAt || tx.date || tx.timestamp) && (
                        <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                          {new Date(tx.createdAt || tx.date || tx.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ color: amountColor, fontSize: '15px', fontWeight: '700', fontFamily: 'monospace' }}>
                    {sign}₹{parseFloat(Number(amount).toFixed(2))}
                  </div>
                </div>
                );
              })}
            </div>
            
            {transactions.length > 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <button 
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: '#94a3b8',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  {showAllTransactions ? 'Show Less' : `View ${transactions.length - 3} More`}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showAllTransactions ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletRechargeScreen;

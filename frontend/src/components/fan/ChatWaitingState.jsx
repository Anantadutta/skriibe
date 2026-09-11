import React from 'react';

const ChatWaitingState = ({ creator, onCancel, creatorJoined, onAccept, chatStartTime }) => {
  const [now, setNow] = React.useState(Date.now());
  const [mountTime] = React.useState(Date.now());

  React.useEffect(() => {
    if (creatorJoined) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [creatorJoined]);

  const effectiveStartTime = chatStartTime ? new Date(chatStartTime).getTime() : mountTime;
  const elapsedMs = now - effectiveStartTime;
  
  // Cap remaining time between 0 and 120000 to handle clock skew and prevent freezing
  const remainingMs = Math.max(0, Math.min(120000, 120000 - elapsedMs));
  const mins = Math.floor(remainingMs / 60000);
  const secs = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ background: '#13161C', borderRadius: '24px', padding: '48px 24px', border: '1px solid #1F2937' }}>
        
        <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 24px' }}>
          {creator?.avatarUrl ? (
            <img 
              src={creator.avatarUrl.startsWith('http') ? creator.avatarUrl : `http://localhost:5000${creator.avatarUrl}`} 
              alt={creator?.name} 
              style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', position: 'relative', zIndex: 2 }}
            />
          ) : (
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '36px', fontWeight: 'bold', position: 'relative', zIndex: 2 }}>
              {creator?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: creatorJoined ? '2px solid #22c55e' : '2px solid #3BA8D8',
            borderRadius: '50%',
            animation: 'ripple 2s infinite',
            zIndex: 1
          }}></div>
        </div>

        <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '1.4rem' }}>
          Waiting for {creator?.name}
        </h3>
        
        {creatorJoined ? (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '32px' }}>
            <p style={{ color: '#22c55e', margin: '0 0 16px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
              Creator has joined, are you willing to join?
            </p>
            <button
              onClick={onAccept}
              style={{
                background: '#22c55e',
                color: '#111',
                border: 'none',
                borderRadius: '100px',
                padding: '12px 32px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              Accept
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ color: '#ef4444', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'monospace' }}>
              {mins}:{secs}
            </div>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              the creator will join in some time
            </p>
          </div>
        )}

        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '100px',
            padding: '12px 24px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Cancel Request
        </button>

      </div>
      
      <style>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ChatWaitingState;

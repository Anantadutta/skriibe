import React from 'react';

const ChatWaitingState = ({ creator, onCancel, creatorJoined, onAccept, chatStartTime, creatorJoinedAt, isContinueChat }) => {
  const [now, setNow] = React.useState(Date.now());
  const [mountTime] = React.useState(Date.now());
  const [creatorJoinedTime, setCreatorJoinedTime] = React.useState(null);
  const hasTimedOutRef = React.useRef(false);

  // Synchronously record transition time when creator joins so render never falls back to mountTime
  if (creatorJoined && !creatorJoinedTime) {
    setCreatorJoinedTime(Date.now());
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (creatorJoined) {
      hasTimedOutRef.current = false;
    }
  }, [creatorJoined]);

  const effectiveStartTime = creatorJoined 
    ? (creatorJoinedAt && (Date.now() - new Date(creatorJoinedAt).getTime() < 120000) 
        ? new Date(creatorJoinedAt).getTime() 
        : (creatorJoinedTime || now))
    : (chatStartTime && (Date.now() - new Date(chatStartTime).getTime() < 120000) 
        ? new Date(chatStartTime).getTime() 
        : mountTime);

  const elapsedMs = Math.max(0, now - effectiveStartTime);
  
  // Cap remaining time between 0 and 120000 (2 minutes)
  const remainingMs = Math.max(0, Math.min(120000, 120000 - elapsedMs));
  const mins = Math.floor(remainingMs / 60000);
  const secs = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');

  // Trigger timeout if time runs out
  React.useEffect(() => {
    const phaseStart = creatorJoined ? (creatorJoinedTime || mountTime) : mountTime;
    if (remainingMs <= 0 && (now - phaseStart > 5000) && !hasTimedOutRef.current) {
      hasTimedOutRef.current = true;
      if (onCancel) onCancel();
    }
  }, [remainingMs, onCancel, now, mountTime, creatorJoined, creatorJoinedTime]);

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

        <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.4rem' }}>
          {creatorJoined 
            ? `Connected with ${creator?.name || 'Creator'}` 
            : (isContinueChat ? `Waiting for ${creator?.name || 'Creator'} to accept continue chat` : `Waiting for ${creator?.name || 'Creator'}`)}
        </h3>
        
        {creatorJoined ? (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
            <p style={{ color: '#22c55e', margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '1.15rem' }}>
              {isContinueChat 
                ? 'Creator accepted continue request, are you willing to join?' 
                : `${creator?.name || 'Creator'} accepted your chat request, are you willing to join?`}
            </p>
            <div style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: 'bold', margin: '8px 0', fontFamily: 'monospace', textShadow: '0 0 16px rgba(245, 158, 11, 0.3)' }}>
              {mins}:{secs}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' }}>
              Time remaining to accept and start the chat
            </p>
            <button
              onClick={onAccept}
              style={{
                background: '#22c55e',
                color: '#111',
                border: 'none',
                borderRadius: '100px',
                padding: '14px 40px',
                fontWeight: '800',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.4)',
                transition: 'transform 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Accept
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'monospace' }}>
              {mins}:{secs}
            </div>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StartChatModal from './StartChatModal';
import { checkIfLiveNow } from '../../utils/timeUtils';

const LiveChatEntryPoint = ({ creator, isBanned, effectiveIsPreview, isLoggedIn }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  
  let dynamicallyLive = false;
  if (creator.isLive === true) {
    dynamicallyLive = true;
  } else {
    dynamicallyLive = checkIfLiveNow(creator.liveChatTimeSlots);
  }

  if (!dynamicallyLive || !creator.liveChatEnabled) return null;

  return (
    <React.Fragment>
      <button
        onClick={() => {
          if (isBanned || effectiveIsPreview) return;
          if (!isLoggedIn && !effectiveIsPreview) {
            navigate(`/fan/login?redirect=/${creator.handle}`);
          } else {
            setShowModal(true);
          }
        }}
      style={{
        background: (isBanned || effectiveIsPreview) ? '#333' : 'linear-gradient(90deg, #3BA8D8, #1a6a9a)',
        color: (isBanned || effectiveIsPreview) ? '#888' : '#fff',
        border: 'none',
        borderRadius: '100px',
        padding: '16px',
        fontWeight: '700',
        fontSize: '16px',
        width: '100%',
        cursor: (isBanned || effectiveIsPreview) ? 'not-allowed' : 'pointer',
        transition: 'transform 0.2s',
        boxShadow: (isBanned || effectiveIsPreview) ? 'none' : '0 4px 14px rgba(59, 168, 216, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '12px'
      }}
      onMouseOver={(e) => { if (!isBanned && !effectiveIsPreview) e.currentTarget.style.transform = 'scale(1.02)' }}
      onMouseOut={(e) => { if (!isBanned && !effectiveIsPreview) e.currentTarget.style.transform = 'scale(1)' }}
    >
      <span style={{ 
        width: '10px', 
        height: '10px', 
        background: '#22c55e', 
        borderRadius: '50%', 
        display: 'inline-block', 
        boxShadow: '0 0 8px #22c55e',
        animation: 'pulse 2s infinite'
      }}></span>
      {effectiveIsPreview ? 'Live Chat Preview' : `Live Chat (₹${creator.liveChatRate || 10}/min) →`}
    </button>
    {showModal && (
      <StartChatModal 
        creatorName={creator.name || creator.handle}
        onConfirm={() => {
          setShowModal(false);
          navigate(`/${creator.handle}/recharge`);
        }}
        onClose={() => setShowModal(false)}
      />
    )}
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>
    </React.Fragment>
  );
};

export default LiveChatEntryPoint;

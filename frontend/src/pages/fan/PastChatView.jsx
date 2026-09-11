import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { CHAT_THEMES } from '../../utils/themes';

const PastChatView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = CHAT_THEMES.default;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/chat/${sessionId}`);
        if (res.data.success) {
          setSession(res.data.session);
          setMessages(res.data.session.messages || []);
        } else {
          setError(res.data.message || 'Failed to fetch chat session');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching the chat session.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const creator = session?.creatorId || {};
  const handle = creator.handle || 'Creator';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f9fafb' }}>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>Loading chat history...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9fafb' }}>
        <p style={{ color: '#ef4444', fontSize: '18px', marginBottom: '16px' }}>{error || 'Chat session not found.'}</p>
        <button onClick={() => navigate(-1)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100%', 
      margin: '0 auto', 
      background: theme.background, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      position: 'relative' 
    }}>
      {/* Background Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: theme.backgroundColor, zIndex: 0 }} />
      
      {/* Header */}
      <div style={{ background: theme.headerBackground, position: 'sticky', top: 0, zIndex: 10, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: theme.headerColor, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.headerBackground, fontWeight: 'bold', overflow: 'hidden' }}>
          {creator?.avatarUrl ? (
            <img src={creator.avatarUrl.startsWith('http') ? creator.avatarUrl : `http://localhost:5000${creator.avatarUrl}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt={handle} />
          ) : (
            handle.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h2 style={{ color: theme.headerColor, margin: 0, fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {creator?.name || handle}
            {creator?.expertise && <span style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.85 }}>• {Array.isArray(creator.expertise) ? creator.expertise.join(' • ') : creator.expertise}</span>}
          </h2>
          <div style={{ color: '#bbf7d0', fontSize: '0.85rem', fontWeight: '600' }}>
            Duration: {session.totalMinutes?.toFixed(1) || 0} mins | Spent: ₹{session.totalCost?.toFixed(2) || 0}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1 }}>
        {messages.map((m, i) => {
          if (m.sender === 'system') {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#ef4444', padding: '6px 12px', borderRadius: '16px', fontSize: '0.8rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  {m.content}
                </div>
              </div>
            );
          }

          const isFan = (m.sender || m.senderRole) === 'fan';
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isFan ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                maxWidth: '75%', 
                padding: '12px 16px', 
                borderRadius: '16px',
                borderTopRightRadius: isFan ? '4px' : '16px',
                borderTopLeftRadius: !isFan ? '4px' : '16px',
                background: isFan ? theme.senderBubble : theme.receiverBubble,
                color: isFan ? theme.senderText : theme.receiverText,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                    {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isFan && (
                    m.readAt ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '-3px' }}>
                        <path d="M18 6L7 17L2 12"></path>
                        <path d="M22 6L11 17"></path>
                      </svg>
                    ) : m.deliveredAt ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, marginBottom: '-3px' }}>
                        <path d="M18 6L7 17L2 12"></path>
                        <path d="M22 6L11 17"></path>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, marginBottom: '-3px' }}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PastChatView;

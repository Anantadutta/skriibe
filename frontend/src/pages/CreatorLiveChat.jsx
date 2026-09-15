import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { mergeAndSortMessages } from '../utils/chatUtils';
import { CHAT_THEMES } from '../utils/themes';

const CreatorLiveChat = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { authData } = useAuth();
  
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState('waiting_for_fan');
  const [waitingTimeLeft, setWaitingTimeLeft] = useState(120);
  const [isTyping, setIsTyping] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [fanPaused, setFanPaused] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [incomingContinueRequest, setIncomingContinueRequest] = useState(null);

  const QUICK_REACTIONS = ['❤️', '😂', '😮', '👍', '👎'];
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const EMOJIS = [
    '😀','😃','😄','😁','😆','😅','😂','🤣','😭','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙',
    '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥',
    '😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓',
    '🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😱','😖','😣','😞',
    '😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖',
    '👋','🤚','🖐','✋','🖖','👌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎',
    '✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾',
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','✨','🔥','💯'
  ];
  
  const theme = CHAT_THEMES.default;

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Chat
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        setError('');
        setIncomingContinueRequest(null);

        // Guarantee creator acceptance is recorded in backend and awaited
        const acceptRes = await api.post('/chat/creator-accept', { sessionId }).catch(err => {
          console.error('creator-accept error:', err);
          return null;
        });

        try {
          const saved = JSON.parse(localStorage.getItem('skriibe_dismissed_sessions') || '[]');
          if (!saved.includes(String(sessionId))) {
            saved.push(String(sessionId));
            localStorage.setItem('skriibe_dismissed_sessions', JSON.stringify(saved));
          }
        } catch (e) {}

        const res = await api.get(`/chat/${sessionId}`);
        if (res.data.success) {
          const currentSession = res.data.session;
          if (acceptRes?.data?.creatorJoinedAt && !currentSession.creatorJoinedAt) {
            currentSession.creatorJoined = true;
            currentSession.creatorJoinedAt = acceptRes.data.creatorJoinedAt;
          }
          setSession(currentSession);

          // Calculate synchronized waiting time from creatorJoinedAt
          const joinedTime = currentSession.creatorJoinedAt || acceptRes?.data?.creatorJoinedAt || currentSession.startTime || new Date().toISOString();
          const elapsedWait = Math.floor((Date.now() - new Date(joinedTime).getTime()) / 1000);
          const remainingWait = Math.max(0, 120 - elapsedWait);
          setWaitingTimeLeft(remainingWait);

          if (currentSession.status === 'ended' || currentSession.fanAccepted) {
            setViewState('active');
          } else {
            setViewState('waiting_for_fan');
          }

          if (currentSession.messages && currentSession.messages.length > 0) {
            setMessages(currentSession.messages);
          } else {
            setMessages([{
              messageId: 'sys_init',
              sender: 'system',
              content: 'Live chat connected. Start typing your message below.',
              isAutomated: true,
              sentAt: new Date().toISOString()
            }]);
          }
          const chatId = currentSession._id || currentSession.id || sessionId;
          connectSocket(chatId);
        }
      } catch (err) {
        setError('Chat session not found or ended.');
      } finally {
        setLoading(false);
      }
    };
    initChat();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [sessionId]);

  // Timer logic
  useEffect(() => {
    if (!session || !session.startTime || error) return;
    
    // Calculate initial elapsed time
    const initialElapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
    setElapsedSeconds(Math.max(0, initialElapsed));

    let timer;
    if (session.status === 'active' && !fanPaused && viewState === 'active') {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [error, session, fanPaused, viewState]);

  useEffect(() => {
    let timer;
    if (viewState === 'waiting_for_fan' && !error && !loading && session) {
      const joinedTime = session.creatorJoinedAt || session.startTime || new Date().toISOString();
      const tick = () => {
        const elapsedWait = Math.floor((Date.now() - new Date(joinedTime).getTime()) / 1000);
        const remainingWait = Math.max(0, 120 - elapsedWait);
        setWaitingTimeLeft(remainingWait);
        if (remainingWait <= 0) {
          if (timer) clearInterval(timer);
          handleEndChat();
        }
      };
      tick();
      timer = setInterval(tick, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [viewState, error, loading, session]);

  useEffect(() => {
    const handleFocus = () => {
      if (!socketRef.current || !session) return;
      messages.forEach(m => {
        if ((m.sender || m.senderRole) !== 'creator' && !m.readAt) {
          socketRef.current.emit('message_read', { 
            messageId: m.messageId, 
            sessionId: session._id || session.id || session.sessionId 
          });
        }
      });
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [messages, session]);

  const connectSocket = (id) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const newSocket = io(apiUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = newSocket;
    
    newSocket.on('connect', () => {
      console.log('Creator connected to socket, joining room:', id);
      newSocket.emit('join_chat', { sessionId: id, role: 'creator', userId: authData?.userId });
    });
    
    if (newSocket.connected) {
      console.log('Creator already connected, joining room:', id);
      newSocket.emit('join_chat', { sessionId: id, role: 'creator', userId: authData?.userId });
    }

    newSocket.on('receive_message', (msg) => {
      console.log('Creator received message:', msg);
      setMessages(prev => mergeAndSortMessages(prev, msg));
      
      if ((msg.sender || msg.senderRole) !== 'creator') {
        if (document.hasFocus()) {
          newSocket.emit('message_read', { messageId: msg.messageId, sessionId: id });
        } else {
          newSocket.emit('message_delivered', { messageId: msg.messageId, sessionId: id });
        }
      }
    });
    
    newSocket.on('message_status_update', (msg) => {
      setMessages(prev => mergeAndSortMessages(prev, msg));
    });

    newSocket.on('message_reacted', ({ messageId, emoji, senderRole }) => {
      setMessages(prev => prev.map(m => {
        if (m.messageId === messageId) {
          const newReactions = (m.reactions || []).filter(r => r.senderRole !== senderRole);
          newReactions.push({ emoji, senderRole });
          return { ...m, reactions: newReactions };
        }
        return m;
      }));
    });

    newSocket.on('typing', ({ sender }) => {
      if (sender !== 'creator') setIsTyping(true);
    });

    newSocket.on('stop_typing', ({ sender }) => {
      if (sender !== 'creator') setIsTyping(false);
    });

    newSocket.on('chat_error', (data) => {
      setError(data.message);
      setSession(prev => prev ? { ...prev, status: 'ended' } : prev);
      setViewState('ended');
      newSocket.disconnect();
    });

    newSocket.on('fan_accepted', (data) => {
      setSession(prev => prev ? { ...prev, status: 'active', startTime: data?.startTime || prev.startTime } : prev);
      setViewState('active');
    });

    newSocket.on('fan_recharging_pause', () => {
      setFanPaused(true);
    });

    newSocket.on('wallet_recharged', () => {
      setFanPaused(false);
    });

    newSocket.on('fan_profile_updated', (data) => {
      if (!data || !data.fanId) return;
      setSession(prev => {
        if (!prev) return prev;
        const currentFanId = (prev.fanId?._id || prev.fanId || '').toString();
        if (currentFanId === String(data.fanId)) {
          return {
            ...prev,
            fanId: {
              ...(prev.fanId || {}),
              name: data.name,
              ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {})
            }
          };
        }
        return prev;
      });
    });

    newSocket.on('wallet_update', (data) => {
      if (data.balance !== undefined) {
        setSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            fanId: {
              ...(prev.fanId || {}),
              walletBalance: data.balance
            }
          };
        });
        if (data.balance > 0) {
          setFanPaused(false);
        }
      }
    });

    const creatorRoomId = authData?.creatorId || authData?.userId || session?.creatorId?._id || session?.creatorId;
    if (creatorRoomId) {
      newSocket.emit('join_creator_room', { creatorId: creatorRoomId });
    }

    newSocket.on('incoming_chat_request', (data) => {
      console.log('Creator received incoming_chat_request in live chat view:', data);
      if (data && data.isContinueChat) {
        setIncomingContinueRequest(data);
      }
    });

    newSocket.on('chat_ended', (data) => {
      const sId = sessionId || data?.sessionId;

      try {
        if (sId) {
          const savedSessions = JSON.parse(localStorage.getItem('skriibe_dismissed_sessions') || '[]');
          if (!savedSessions.includes(String(sId))) {
            savedSessions.push(String(sId));
            localStorage.setItem('skriibe_dismissed_sessions', JSON.stringify(savedSessions));
          }
        }
      } catch (e) {}
      if (data.reason === 'INSUFFICIENT_BALANCE') {
        setError(`Chat ended automatically: Fan ran out of balance. Duration: ${Math.round(data.totalMinutes * 100) / 100} mins. Total earned: ₹${Math.round(data.totalCost * 100) / 100}`);
      } else if (data.reason === 'FREE_TRIAL_ENDED') {
        setError(`Free chat time limit reached (2 minutes). Chat ended automatically.`);
      } else {
        setError(`Chat ended by user. Duration: ${Math.round(data.totalMinutes * 100) / 100} mins. Total earned: ₹${Math.round(data.totalCost * 100) / 100}`);
      }
      setSession(prev => prev ? { ...prev, status: 'ended' } : prev);
      setViewState('ended');
    });

    setSocket(newSocket);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    if (session?.fanAccepted && viewState !== 'active') {
      setViewState('active');
    }
  }, [messages, session?.fanAccepted, viewState]);

  const handleAcceptContinueChat = async (newSessionId) => {
    if (!newSessionId) return;
    try {
      await api.post('/chat/creator-accept', { sessionId: newSessionId });
    } catch (e) {
      console.error('Failed to accept continue chat:', e);
    }
    navigate(`/creator/dashboard/live-chat/${newSessionId}`);
  };

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !session) return;
    const tempId = Date.now().toString() + Math.random().toString();

    const optimisticMsg = {
      sender: 'creator',
      content: input,
      tempId,
      isOptimistic: true,
      sentAt: new Date().toISOString()
    };
    setMessages(prev => mergeAndSortMessages(prev, optimisticMsg));

    socketRef.current.emit('send_message', {
      sessionId: session._id || session.id || session.sessionId,
      sender: 'creator',
      content: input,
      tempId
    });
    
    socketRef.current.emit('stop_typing', { sessionId: session._id || session.id || session.sessionId, sender: 'creator' });
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socketRef.current || !session) return;
    
    socketRef.current.emit('typing', { sessionId: session._id || session.id || session.sessionId, sender: 'creator' });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop_typing', { sessionId: session._id || session.id || session.sessionId, sender: 'creator' });
    }, 1000);
  };

  const handleEndChat = async () => {
    const sId = session?._id || session?.id || session?.sessionId || sessionId;
    if (sId) {
      try {
        await api.post('/chat/end', { sessionId: sId, reason: 'CREATOR_ENDED' });
      } catch (err) {
        console.error('Failed to end chat via API:', err);
      }
      if (socketRef.current) {
        socketRef.current.emit('end_chat', { sessionId: sId });
      } else if (socket) {
        socket.emit('end_chat', { sessionId: sId });
      }
    }
    navigate('/creator/dashboard');
  };

  if (loading) return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading chat...</div>;

  if (viewState === 'waiting_for_fan' && !error) {
    const mins = Math.floor(waitingTimeLeft / 60);
    const secs = waitingTimeLeft % 60;
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#1F2937', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #3BA8D8' }}>
            {session?.fanId?.avatarUrl ? (
              <img src={session.fanId.avatarUrl.startsWith('http') ? session.fanId.avatarUrl : `http://localhost:5000${session.fanId.avatarUrl}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Fan" />
            ) : (
              <span style={{ fontSize: '36px', color: '#3BA8D8', fontWeight: 'bold' }}>{(session?.fanId?.name?.charAt(0) || 'F').toUpperCase()}</span>
            )}
          </div>
          <h2 style={{ fontSize: '24px', margin: '0 0 16px 0', fontWeight: 'bold' }}>
            Waiting for {session?.fanId?.name || 'Fan'} {session?.isContinueChat ? 'to confirm continue chat' : ''}
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.5', margin: '0 0 32px 0' }}>
            {session?.isContinueChat ? 'the fan requested to continue and has 2 minutes to confirm' : 'the fan has been notified and they have 2 minutes to accept'}
          </p>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#f59e0b', textShadow: '0 0 20px rgba(245, 158, 11, 0.3)', margin: '0 0 16px 0', fontFamily: 'monospace' }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            NO CHARGE UNTIL ACCEPTED
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', backgroundImage: `linear-gradient(${theme.backgroundColor}, ${theme.backgroundColor}), ${theme.background}`, backgroundSize: 'cover, cover', backgroundPosition: `center, ${theme.backgroundPosition || 'center'}`, backgroundRepeat: 'no-repeat, no-repeat' }}>
      
      {/* Fan Paused Overlay */}
      {fanPaused && !error && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h2 style={{ margin: '0 0 16px 0', color: '#111', fontSize: '24px' }}>Time's up!</h2>
            <p style={{ color: '#6b7280', margin: 0 }}>Waiting for {session?.fanId?.name || 'the fan'} to recharge their wallet to continue chatting...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: theme.headerBackground, position: 'sticky', top: 0, zIndex: 10, padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.headerBackground, fontWeight: 'bold', overflow: 'hidden' }}>
            {session?.fanId?.avatarUrl ? (
              <img src={session.fanId.avatarUrl.startsWith('http') ? session.fanId.avatarUrl : `http://localhost:5000${session.fanId.avatarUrl}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Fan" />
            ) : (
              (session?.fanId?.name?.charAt(0) || 'F').toUpperCase()
            )}
          </div>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{session?.fanId?.name || 'Fan'}</h2>
            <div style={{ color: '#bbf7d0', fontSize: '0.85rem', fontWeight: '600' }}>
              {(session?.ratePerMinute > 0 || !session?.isFreeChat) && `Balance: ${session?.fanId?.walletBalance > 0 && session?.ratePerMinute > 0 ? `(${Math.floor(Math.max(0, (session.fanId.walletBalance / session.ratePerMinute) * 60 - elapsedSeconds) / 60)} mins)` : ''}`}
            </div>
            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {session?.status === 'active' ? 'Chat in progress.' : 'Chat ended.'} {(session?.chatId || session?._id || session?.sessionId) && <span style={{ opacity: 0.7, marginLeft: '8px', fontWeight: 'normal', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>Chat ID: {String(session?.chatId || session?._id || session?.sessionId).slice(-5)} <span style={{ fontSize: '12px' }}>ℹ️</span></span>}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {session?.status !== 'active' && (
            <button 
              onClick={() => navigate('/creator/dashboard')}
              style={{ background: '#374151', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              BACK
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', textAlign: 'center', borderBottom: '1px solid #ef4444' }}>
          {error}
        </div>
      )}

      {incomingContinueRequest && (
        <div style={{
          background: '#0B0D13',
          border: '2px solid #22C55E',
          borderRadius: '12px',
          padding: '16px 24px',
          margin: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 20px rgba(34, 197, 94, 0.25)',
          zIndex: 50
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
              {incomingContinueRequest.fanName || 'Fan'} requested to continue chat!
            </div>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '2px' }}>
              Click accept to enter the waiting room and continue chatting.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => handleAcceptContinueChat(incomingContinueRequest.sessionId)}
              style={{
                background: '#22C55E',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Accept & Join
            </button>
            <button
              onClick={() => navigate('/creator/dashboard')}
              style={{
                background: 'transparent',
                color: '#9ca3af',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '8px 12px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Active Chat Timer Bar */}
      {!error && session?.status === 'active' && (() => {
        const rate = session?.ratePerMinute || 0;
        const bal = session?.fanId?.walletBalance || 0;
        const isFreeChat = session?.isFreeChat || rate === 0;
        
        let remainingSeconds, isWarning, barBg, innerBg, progressWidth;
        
        if (isFreeChat) {
          remainingSeconds = Math.max(0, 120 - elapsedSeconds);
          isWarning = remainingSeconds <= 30; // warning at 30 seconds
          barBg = isWarning ? '#ef4444' : '#3BA8D8';
          innerBg = isWarning ? '#b91c1c' : '#0284c7';
          progressWidth = `${Math.max(0, Math.min(100, (remainingSeconds / 120) * 100))}%`;
        } else {
          remainingSeconds = Math.max(0, (bal / rate) * 60 - elapsedSeconds);
          isWarning = remainingSeconds / 60 <= 2; // warning at 2 minutes
          barBg = isWarning ? '#f59e0b' : '#10b981';
          innerBg = isWarning ? '#d97706' : '#059669';
          const totalSeconds = (bal / rate) * 60;
          progressWidth = `${bal > 0 ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100)) : 0}%`;
        }
        
        return (
          <div style={{ background: barBg, padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'background 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#000', fontFamily: 'monospace', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isWarning && '⚠️'} {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:{String(Math.floor(remainingSeconds % 60)).padStart(2, '0')} left
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isFreeChat ? (
                  <span style={{ color: '#000', fontWeight: 'bold', fontSize: '1rem', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px' }}>
                    Free Chat
                  </span>
                ) : (
                  <span style={{ color: '#000', fontFamily: 'monospace', fontSize: '1rem' }}>
                    ₹{Math.max(0, bal - (elapsedSeconds / 60) * rate).toFixed(2)} in wallet
                  </span>
                )}
              </div>
            </div>
            <div style={{ width: '100%', height: '8px', background: innerBg, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: progressWidth, 
                height: '100%', 
                background: '#fff',
                transition: 'width 1s linear'
              }}></div>
            </div>
          </div>
        );
      })()}

      {/* Chat Messages */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Chat ID and Date Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
          {(session?.chatId || session?._id || session?.sessionId) && (
            <div style={{ background: '#2563eb', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Chat #{String(session?.chatId || session?._id || session?.sessionId).slice(-5)} <span style={{ fontSize: '14px', cursor: 'help' }} title="Unique Chat ID for support and reference">ℹ️</span>
            </div>
          )}
          <div style={{ background: 'rgba(255,255,255,0.15)', color: '#e2e8f0', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', backdropFilter: 'blur(4px)' }}>
            {new Date(session?.startTime || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {messages.map((m, i) => (
          <div 
            key={i} 
            onMouseEnter={() => setHoveredMessageId(m.messageId)}
            onMouseLeave={() => setHoveredMessageId(null)}
            style={{ display: 'flex', justifyContent: (m.sender || m.senderRole) === 'creator' ? 'flex-end' : ((m.sender || m.senderRole) === 'system' ? 'center' : 'flex-start'), position: 'relative' }}
          >
            {(m.sender || m.senderRole) === 'system' ? (
              <div style={{
                background: '#fff',
                color: m.isAutomated ? '#ef4444' : '#4b5563',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                margin: '8px 0',
                maxWidth: '85%'
              }}>
                {m.content}
              </div>
            ) : (
              <div style={{
                background: (m.sender || m.senderRole) === 'creator' ? theme.senderBubble : theme.receiverBubble,
                color: (m.sender || m.senderRole) === 'creator' ? theme.senderText : theme.receiverText,
                padding: '12px 18px',
                borderRadius: '16px',
                borderTopRightRadius: (m.sender || m.senderRole) === 'creator' ? '4px' : '16px',
                borderTopLeftRadius: (m.sender || m.senderRole) === 'creator' ? '16px' : '4px',
                maxWidth: '75%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                position: 'relative',
                display: 'inline-block'
              }}>
                {hoveredMessageId === m.messageId && (
                  <div style={{
                    position: 'absolute',
                    top: '-36px',
                    [(m.sender || m.senderRole) === 'creator' ? 'right' : 'left']: '0',
                    background: '#202020',
                    padding: '6px 8px',
                    borderRadius: '24px',
                    display: 'flex',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 20
                  }}>
                    {QUICK_REACTIONS.map(emoji => (
                      <span 
                        key={emoji}
                        onClick={() => {
                          if (socketRef.current && session) {
                            socketRef.current.emit('react_message', { messageId: m.messageId, sessionId: session._id || session.id || session.sessionId, emoji, senderRole: 'creator' });
                          }
                        }}
                        style={{ cursor: 'pointer', fontSize: '18px', padding: '2px 4px', transition: 'transform 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
                <span style={{ wordBreak: 'break-word' }}>{m.content}</span>
                {(m.sender || m.senderRole) === 'creator' && (
                  <span style={{ marginLeft: '6px', display: 'inline-flex', alignItems: 'center' }}>
                     {m.readAt ? (
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
                     )}
                  </span>
                )}
                {m.reactions && m.reactions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-12px',
                    [(m.sender || m.senderRole) === 'creator' ? 'right' : 'left']: '16px',
                    background: '#202020',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '2px 6px',
                    fontSize: '12px',
                    display: 'flex',
                    gap: '2px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}>
                    {Array.from(new Set(m.reactions.map(r => r.emoji))).map(emoji => (
                      <span key={emoji}>{emoji}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: theme.receiverBubble, color: theme.receiverText, padding: '10px 14px', borderRadius: '16px', fontSize: '13px', fontStyle: 'italic', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', flexDirection: 'column', background: theme.headerBackground === '#fff' ? '#f8fafc' : '#111827' }}>
        <div style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <button
              onClick={() => !error && session?.status !== 'ended' && setShowEmojiPicker(!showEmojiPicker)}
              disabled={!!error || session?.status === 'ended'}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: (error || session?.status === 'ended') ? 'not-allowed' : 'pointer',
                fontSize: '20px',
                color: '#9ca3af',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                opacity: (error || session?.status === 'ended') ? 0.5 : 1
              }}
            >
              😀
            </button>
            <input 
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              onFocus={() => setShowEmojiPicker(false)}
              placeholder={session?.status === 'ended' ? "Chat ended" : "Type a message..."}
              disabled={!!error || session?.status === 'ended'}
              style={{ width: '100%', background: '#1F2937', border: '1px solid #374151', padding: '14px 20px 14px 44px', borderRadius: '24px', color: '#fff', outline: 'none', fontSize: '15px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', opacity: (error || session?.status === 'ended') ? 0.5 : 1, boxSizing: 'border-box' }}
            />
          </div>

          <button 
            onClick={sendMessage}
            disabled={!!error || session?.status === 'ended'}
            style={{ background: '#3BA8D8', color: '#fff', border: 'none', borderRadius: '50%', width: '48px', height: '48px', cursor: (error || session?.status === 'ended') ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (error || session?.status === 'ended') ? 0.5 : 1, boxShadow: '0 4px 10px rgba(59, 168, 216, 0.4)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(-2px)' }}>
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        
        {showEmojiPicker && !error && (
          <div style={{
            background: '#202020',
            padding: '12px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '8px',
            maxHeight: '250px',
            overflowY: 'auto'
          }}>
            {EMOJIS.map(emoji => (
              <div 
                key={emoji}
                onClick={() => {
                  setInput(prev => prev + emoji);
                  // Don't close immediately, let them type multiple emojis
                }}
                style={{
                  fontSize: '24px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '6px',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                  userSelect: 'none'
                }}
                onMouseEnter={e => e.target.style.background = '#303030'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                {emoji}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorLiveChat;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PreChatScreen from '../../components/fan/PreChatScreen';
import WalletRechargeScreen from '../../components/fan/WalletRechargeScreen';
import InChatRechargeModal from '../../components/fan/InChatRechargeModal';
import ChatSettingsModal from '../../components/fan/ChatSettingsModal';
import ChatWaitingState from '../../components/fan/ChatWaitingState';
import ChatEndScreen from '../../components/fan/ChatEndScreen';
import WalletPaymentButton from '../../components/fan/WalletPaymentButton';
import { mergeAndSortMessages } from '../../utils/chatUtils';
import { CHAT_THEMES } from '../../utils/themes';

const LiveChatInterface = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { authData } = useAuth();
  
  // State Machine: loading_init, pre-chat, recharge, waiting, active, ended
  const [viewState, setViewState] = useState('loading_init');
  
  const [creator, setCreator] = useState(null);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [freeChatEnded, setFreeChatEnded] = useState(false);
  const [error, setError] = useState('');
  const [endStats, setEndStats] = useState({ minutes: 0, cost: 0 });
  const [isTyping, setIsTyping] = useState(false);
  
  const [walletBalance, setWalletBalance] = useState(0);
  const [rate, setRate] = useState(10);
  const [lowBalanceWarning, setLowBalanceWarning] = useState(false);
  const [showRechargeOverlay, setShowRechargeOverlay] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState('default');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [creatorJoined, setCreatorJoined] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [chatStartTime, setChatStartTime] = useState(null);
  const [showChatInfo, setShowChatInfo] = useState(false);

  const QUICK_REACTIONS = ['❤️', '😂', '😮', '👍', '👎'];

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

  const theme = CHAT_THEMES[activeThemeId] || CHAT_THEMES.default;

  useEffect(() => {
    if (!session || !session.startTime || error) return;
    
    // Calculate initial elapsed time securely from the backend's recorded start time
    const initialElapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
    setElapsedSeconds(Math.max(0, initialElapsed));

    let timer;
    if (viewState === 'active') {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [error, session, viewState]);

  useEffect(() => {
    if (viewState === 'active' && rate > 0 && walletBalance > 0) {
      const totalSeconds = (walletBalance / rate) * 60;
      if (elapsedSeconds >= totalSeconds) {
        setShowRechargeOverlay(true);
      } else if (totalSeconds - elapsedSeconds <= 60) {
        // Show low balance warning when 1 minute is left
        setLowBalanceWarning(true);
      } else {
        setLowBalanceWarning(false);
      }
    }
  }, [elapsedSeconds, viewState, walletBalance, rate]);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const waitingTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const cancelIntentRef = useRef(false);

  const viewStateRef = useRef(viewState);
  useEffect(() => { viewStateRef.current = viewState; }, [viewState]);

  const creatorJoinedRef = useRef(creatorJoined);
  useEffect(() => { creatorJoinedRef.current = creatorJoined; }, [creatorJoined]);

  // Helper to start chat
  const startChat = async (currentCreator) => {
    try {
      cancelIntentRef.current = false;
      setCreatorJoined(false);
      setElapsedSeconds(0);
      setError('');
      setEndStats({ minutes: 0, cost: 0 });
      setFreeChatEnded(false);
      setShowRechargeOverlay(false);
      setLowBalanceWarning(false);
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
        waitingTimerRef.current = null;
      }

      const sRes = await api.post('/chat/start', { creatorId: currentCreator._id || currentCreator.id });
      
      // If user clicked cancel while this network request was inflight
      if (cancelIntentRef.current) {
        const sId = sRes.data.sessionId || sRes.data._id || sRes.data.id;
        if (sId) {
          api.post('/chat/end', { sessionId: sId, cancelBeforeStart: true, reason: 'USER_CANCEL' }).catch(() => {});
          if (socketRef.current) {
            socketRef.current.emit('fan_cancelled_request', { sessionId: sId, creatorId: currentCreator._id || currentCreator.id });
          }
        }
        return; // Stop initialization
      }

      if (sRes.data.success) {
        setSession(sRes.data);
        if (sRes.data.rate !== undefined) setRate(sRes.data.rate);
        if (sRes.data.time) setChatStartTime(sRes.data.time);
        
        // Assume waiting unless messages indicate otherwise
        let nextState = 'waiting';
        if (sRes.data.messages && sRes.data.messages.some(m => (m.sender || m.senderRole) === 'creator')) {
          nextState = 'active';
        } else if (sRes.data.messages && sRes.data.messages.some(m => m.sender === 'system' && m.content.includes('has joined'))) {
          setCreatorJoined(true);
        }
        setViewState(nextState);
        if (sRes.data.messages && sRes.data.messages.length > 0) {
          setMessages(prev => {
            if (prev.length === 0) return sRes.data.messages;
            const merged = [...prev, ...sRes.data.messages];
            const unique = Array.from(new Map(merged.map(m => [m.messageId || m.tempId, m])).values());
            return unique.sort((a,b) => new Date(a.sentAt) - new Date(b.sentAt));
          });
        } else {
          setMessages(prev => {
            if (prev.length > 0) {
              return [...prev, {
                messageId: 'sys_init_' + Date.now(),
                sender: 'system',
                content: 'Live chat reconnected. Start typing your message below.',
                isAutomated: true,
                sentAt: new Date().toISOString()
              }];
            }
            return [{
              messageId: 'sys_init',
              sender: 'system',
              content: 'Live chat connected. Start typing your message below.',
              isAutomated: true,
              sentAt: new Date().toISOString()
            }];
          });
        }
        connectSocket(sRes.data.sessionId);
        
        // Calculate precisely how much time is left from the backend's chat start time
        const elapsed = sRes.data.time ? Date.now() - new Date(sRes.data.time).getTime() : 0;
        const remainingToWait = Math.max(0, 120000 - elapsed);
        
        waitingTimerRef.current = setTimeout(async () => {
          if (creatorJoinedRef.current || viewStateRef.current === 'active' || viewStateRef.current === 'ended') {
            return;
          }
          // If this fires, the creator hasn't joined (which would clear the timer)
          // We should end the chat on the backend so it doesn't linger in their queue
          try {
            await api.post('/chat/end', { sessionId: sRes.data.sessionId, cancelBeforeStart: true, reason: 'TIMEOUT' });
          } catch (e) {
            console.error('Failed to end pending chat', e);
          }
          navigate(`/${currentCreator.handle || handle}`, { state: { showStuckModal: true } });
        }, remainingToWait);
      }
    } catch (err) {
      if (cancelIntentRef.current) return;
      if (err.response?.status === 400 && err.response?.data?.required) {
        setWalletBalance(err.response.data.balance || 0);
        setError(err.response.data.message || 'Insufficient balance to start chat');
        setViewState('ended');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to start chat');
        setViewState('ended');
      }
    }
  };

  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      try {
        const cRes = await api.get(`/public/creator/${handle}`);
        if (!cRes.data.success) throw new Error('Creator not found');
        const foundCreator = cRes.data.creator;
        setCreator(foundCreator);
        setRate(foundCreator.liveChatRate || 10);
        
        const savedTheme = localStorage.getItem(`chat_theme_${foundCreator._id || foundCreator.id}`);
        if (savedTheme && CHAT_THEMES[savedTheme]) {
          setActiveThemeId(savedTheme);
        }

        const wRes = await api.get('/wallet/balance');
        if (wRes.data.success) {
          setWalletBalance(wRes.data.balance);
        }

        // Auto-start chat
        await startChat(foundCreator);
        
      } catch (err) {
        if (cancelIntentRef.current) return;
        setError(err.response?.data?.message || err.message || 'Failed to load chat details');
        setViewState('ended');
      }
    };
    initData();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
    };
  }, [handle]);

  useEffect(() => {
    if (messages.some(m => (m.sender || m.senderRole) === 'system' && m.content.includes('has joined'))) {
      if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
      setCreatorJoined(true);
    }
    if (messages.some(m => (m.sender || m.senderRole) === 'creator')) {
      setViewState('active');
    }
  }, [messages]);

  useEffect(() => {
    const handleFocus = () => {
      if (!socketRef.current || !session) return;
      messages.forEach(m => {
        if ((m.sender || m.senderRole) !== 'fan' && !m.readAt) {
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

  const connectSocket = (sessionId) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const newSocket = io(apiUrl);
    socketRef.current = newSocket;
    
    newSocket.on('connect', () => {
      console.log('Fan connected to socket, joining room:', sessionId);
      newSocket.emit('join_chat', { sessionId, role: 'fan', userId: authData?.userId });
    });
    
    if (newSocket.connected) {
      console.log('Fan already connected, joining room:', sessionId);
      newSocket.emit('join_chat', { sessionId, role: 'fan', userId: authData?.userId });
    }

    newSocket.on('creator_joined', () => {
      if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
      setCreatorJoined(true);
      setMessages(prev => {
        if (prev.some(m => m.content && m.content.includes('has joined'))) return prev;
        return mergeAndSortMessages(prev, {
          messageId: 'sys_' + Date.now(),
          sender: 'system',
          content: `Hey, ${creator?.name || 'the creator/expert'} has joined.`,
          isAutomated: false,
          sentAt: new Date().toISOString()
        });
      });
    });

    newSocket.on('fan_accepted', (data) => {
      setViewState('active');
      if (data?.startTime) {
        setSession(prev => prev ? { ...prev, startTime: data.startTime } : prev);
      }
    });

    newSocket.on('receive_message', (msg) => {
      console.log('Fan received message:', msg);
      setMessages(prev => mergeAndSortMessages(prev, msg));
      
      // Emit delivered or read based on focus
      if ((msg.sender || msg.senderRole) !== 'fan') {
        if (document.hasFocus()) {
          newSocket.emit('message_read', { messageId: msg.messageId, sessionId });
        } else {
          newSocket.emit('message_delivered', { messageId: msg.messageId, sessionId });
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
      if (sender !== 'fan') setIsTyping(true);
    });

    newSocket.on('stop_typing', ({ sender }) => {
      if (sender !== 'fan') setIsTyping(false);
    });

    newSocket.on('wallet_update', (data) => {
      if (data.balance !== undefined) {
        setWalletBalance(data.balance);
      }
    });

    newSocket.on('chat_error', (data) => {
      if (cancelIntentRef.current) return;
      setError(data.message);
      setViewState('ended');
      newSocket.disconnect();
    });

    newSocket.on('chat_ended', (data) => {
      if (cancelIntentRef.current || data?.reason === 'USER_CANCEL' || data?.reason === 'TIMEOUT' || viewStateRef.current === 'waiting') {
        newSocket.disconnect();
        return;
      }
      setEndStats({ minutes: data.totalMinutes, cost: data.totalCost });
      if (data.reason === 'INSUFFICIENT_BALANCE') {
        setShowRechargeOverlay(true);
      } else if (data.reason === 'FREE_TRIAL_ENDED') {
        setFreeChatEnded(true);
        setShowRechargeOverlay(true);
      } else {
        setViewState('ended');
      }
      // Only disconnect if it's not a pausable state
      if (data.reason !== 'INSUFFICIENT_BALANCE' && data.reason !== 'FREE_TRIAL_ENDED') {
        newSocket.disconnect();
      }
    });

    newSocket.on('fan_recharging_pause', () => {
      setShowRechargeOverlay(true);
    });

    newSocket.on('wallet_recharged', () => {
      // Handled automatically by wallet_update, but ensures the modal is closed
      setShowRechargeOverlay(false);
      setLowBalanceWarning(false);
    });

    newSocket.on('low_balance_warning', () => {
      setLowBalanceWarning(true);
    });

    setSocket(newSocket);
  };

  useEffect(() => {
    if (viewState === 'active') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, viewState]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !session) return;
    const tempId = Date.now().toString() + Math.random().toString();
    
    // Optimistic UI
    const optimisticMsg = {
      sender: 'fan',
      content: input,
      tempId,
      isOptimistic: true,
      sentAt: new Date().toISOString()
    };
    setMessages(prev => mergeAndSortMessages(prev, optimisticMsg));

    socketRef.current.emit('send_message', {
      sessionId: session.sessionId || session._id || session.id,
      sender: 'fan',
      content: input,
      tempId
    });
    
    socketRef.current.emit('stop_typing', { sessionId: session.sessionId || session._id || session.id, sender: 'fan' });
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socketRef.current || !session) return;
    
    socketRef.current.emit('typing', { sessionId: session.sessionId || session._id || session.id, sender: 'fan' });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop_typing', { sessionId: session.sessionId || session._id || session.id, sender: 'fan' });
    }, 1000);
  };

  const handleEndChat = async () => {
    cancelIntentRef.current = true;
    const isWaiting = viewState === 'waiting';
    if (isWaiting) {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
        waitingTimerRef.current = null;
      }
      const sId = session?.sessionId || session?._id || session?.id;
      if (socketRef.current) {
        if (sId) {
          socketRef.current.emit('fan_cancelled_request', { 
             sessionId: sId,
             creatorId: creator?._id || creator?.id 
          });
        }
        socketRef.current.disconnect();
      }
      if (sId) {
        api.post('/chat/end', { sessionId: sId, cancelBeforeStart: true, reason: 'USER_CANCEL' }).catch(err => {
          console.error('Failed to cancel chat', err);
        });
      }
      navigate(`/${handle}`);
      return;
    }
    try {
      const sId = session?.sessionId || session?._id || session?.id;
      if (sId) {
        // Force server to end the chat via REST
        const res = await api.post('/chat/end', { sessionId: sId });
        if (res.data.success) {
          setEndStats({ minutes: res.data.totalMinutes, cost: res.data.totalCost });
          if (session?.isFreeChat) {
            setFreeChatEnded(true);
            setShowRechargeOverlay(true);
          } else {
            setViewState('ended');
            if (socketRef.current) socketRef.current.disconnect();
          }
        }
      }
    } catch (err) {
      console.error('Failed to end chat via API, falling back to socket', err);
      const sId = session?.sessionId || session?._id || session?.id;
      if (socket && sId) {
        socket.emit('end_chat', { sessionId: sId });
      }
    }
  };

  if (cancelIntentRef.current) {
    return null;
  }

  if (viewState === 'loading_init') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3BA8D8', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid rgba(59, 168, 216, 0.3)', borderTopColor: '#3BA8D8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ fontWeight: 'bold' }}>Loading...</div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (viewState === 'ended') {
    if (cancelIntentRef.current) return null;
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', paddingTop: '40px' }}>
        <ChatEndScreen 
          creator={creator} 
          sessionId={session?.sessionId || session?._id || session?.id}
          totalMinutes={endStats?.minutes || 0} 
          totalCost={endStats?.cost || 0} 
          error={endStats?.error || error}
          messages={messages}
          isFreeChat={session?.isFreeChat || freeChatEnded}
          rate={rate}
          walletBalance={walletBalance}
          onBack={() => navigate(`/${handle}`)}
          onDone={() => navigate('/explore')}
          onContinueChat={async () => {
            setError('');
            await startChat(creator);
          }}
        />
      </div>
    );
  }



  const handleAcceptChat = () => {
    if (socketRef.current && session) {
      socketRef.current.emit('fan_accepted', { sessionId: session.sessionId || session._id || session.id });
      setViewState('active');
    }
  };

  if (viewState === 'waiting') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', paddingTop: '40px' }}>
        <ChatWaitingState 
          creator={creator} 
          onCancel={handleEndChat} 
          creatorJoined={creatorJoined}
          onAccept={handleAcceptChat}
          chatStartTime={chatStartTime}
        />
      </div>
    );
  }

  // ACTIVE CHAT VIEW
  return (
    <div style={{ height: '100vh', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', backgroundImage: `linear-gradient(${theme.backgroundColor}, ${theme.backgroundColor}), ${theme.background}`, backgroundSize: 'cover, cover', backgroundPosition: `center, ${theme.backgroundPosition || 'center'}`, backgroundRepeat: 'no-repeat, no-repeat' }}>
      
      {/* Settings Modal */}
      {showSettings && (
        <ChatSettingsModal 
          currentThemeId={activeThemeId}
          onSelectTheme={(id) => {
            setActiveThemeId(id);
            if (creator) {
              localStorage.setItem(`chat_theme_${creator._id || creator.id}`, id);
            }
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* End Confirm Modal */}
      {showEndConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#13161C', borderRadius: '16px', border: '1px solid #1F2937', padding: '32px', maxWidth: '350px', width: '90%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <h3 style={{ color: '#fff', margin: '0 0 16px 0', fontSize: '1.25rem' }}>End this chat?</h3>
            <p style={{ color: '#94a3b8', margin: '0 0 24px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to end this chat? You will be billed for the minutes you've used so far.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowEndConfirm(false)} 
                style={{ flex: 1, background: 'transparent', color: '#fff', border: '1px solid #374151', borderRadius: '12px', padding: '12px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowEndConfirm(false);
                  handleEndChat();
                }} 
                style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Yes, end chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Info Modal */}
      {showChatInfo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#13161C', borderRadius: '16px', border: '1px solid #1F2937', padding: '32px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setShowChatInfo(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            <h3 style={{ color: '#fff', margin: '0 0 24px 0', fontSize: '1.25rem', borderBottom: '1px solid #1F2937', paddingBottom: '16px' }}>Chat Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Creator</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{creator?.name || handle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Expertise</span>
                <span style={{ color: '#fff', fontWeight: 'bold', textAlign: 'right', maxWidth: '60%' }}>{Array.isArray(creator?.expertise) ? creator.expertise.join(', ') : creator?.expertise || 'N/A'}</span>
              </div>
              <div style={{ height: '1px', background: '#1F2937', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Duration so far</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{Math.floor(elapsedSeconds / 60)} mins {elapsedSeconds % 60} secs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Amount spent</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>₹{((elapsedSeconds / 60) * rate).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Available balance</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{Math.max(0, walletBalance - (elapsedSeconds / 60) * rate).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recharge Overlay (Mid-Chat) */}
      {showRechargeOverlay && (() => {
        const isFreeChat = session?.isFreeChat || rate === 0;
        const remainingSeconds = isFreeChat ? 1 : Math.max(0, (walletBalance / rate) * 60 - elapsedSeconds);
        const isManual = remainingSeconds > 0;
        
        return (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.4)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '500px', display: 'flex' }}>
              <InChatRechargeModal 
                creatorName={creator?.name || handle}
                statsMinutes={endStats.minutes}
                isManual={isManual && !freeChatEnded}
                isFreeChatEnded={freeChatEnded}
                onClose={() => setShowRechargeOverlay(false)}
                onCancel={() => {
                  if (isManual && !freeChatEnded) {
                    setShowRechargeOverlay(false);
                  } else {
                    setShowRechargeOverlay(false);
                    setViewState('ended');
                    if (socketRef.current) {
                      socketRef.current.emit('end_chat', { sessionId: session?._id || session?.sessionId || session?.id });
                    }
                  }
                }}
                onRechargeSuccess={async (newBal) => {
                  setWalletBalance(newBal);
                  setLowBalanceWarning(false);
                  setShowRechargeOverlay(false);
                  if (freeChatEnded) {
                    setViewState('ended');
                    if (socketRef.current) socketRef.current.disconnect();
                  } else {
                    if (socketRef.current) {
                      socketRef.current.emit('wallet_recharged', { sessionId: session?._id || session?.sessionId || session?.id });
                    }
                  }
                }}
              />
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div style={{ background: theme.headerBackground, position: 'sticky', top: 0, zIndex: 10, padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.headerBackground, fontWeight: 'bold', overflow: 'hidden' }}>
            {creator?.avatarUrl ? (
              <img src={creator.avatarUrl.startsWith('http') ? creator.avatarUrl : `http://localhost:5000${creator.avatarUrl}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt={handle} />
            ) : (
              handle.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {creator?.name || handle}
              {creator?.expertise && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: '800', 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  padding: '3px 10px', 
                  borderRadius: '12px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  {Array.isArray(creator.expertise) ? creator.expertise.join(' • ') : creator.expertise}
                </span>
              )}
            </h2>
            <div style={{ color: '#bbf7d0', fontSize: '0.85rem', fontWeight: '600' }}>
              {(rate > 0 || !session?.isFreeChat) && `Balance: ${walletBalance > 0 && rate > 0 ? `(${Math.floor(Math.max(0, (walletBalance / rate) * 60 - elapsedSeconds) / 60)} mins)` : ''}`}
            </div>
            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Chat in progress. {(session?.chatId || session?.sessionId || session?._id) && <span style={{ opacity: 0.7, marginLeft: '8px', fontWeight: 'normal', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setShowChatInfo(true)}>Chat ID: {String(session?.chatId || session?.sessionId || session?._id).slice(-5)} <span style={{ fontSize: '12px' }}>ℹ️</span></span>}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setShowEndConfirm(true)}
            style={{ background: '#fff', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            END
          </button>
        </div>
      </div>

      {/* Active Chat Timer Bar */}
      {viewState === 'active' && !showRechargeOverlay && (() => {
        const isFreeChat = session?.isFreeChat || rate === 0;
        let remainingSeconds, isWarning, barBg, innerBg, progressWidth;

        if (isFreeChat) {
          remainingSeconds = Math.max(0, 120 - elapsedSeconds);
          isWarning = remainingSeconds <= 30; // warning at 30 seconds
          barBg = isWarning ? '#ef4444' : '#3BA8D8';
          innerBg = isWarning ? '#b91c1c' : '#0284c7';
          progressWidth = `${Math.max(0, Math.min(100, (remainingSeconds / 120) * 100))}%`;
        } else {
          remainingSeconds = Math.max(0, (walletBalance / rate) * 60 - elapsedSeconds);
          isWarning = remainingSeconds / 60 <= 2; // warning at 2 minutes
          barBg = isWarning ? '#f59e0b' : '#10b981';
          innerBg = isWarning ? '#d97706' : '#059669';
          const totalSeconds = (walletBalance / rate) * 60;
          progressWidth = `${walletBalance > 0 ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100)) : 0}%`;
        }
        
        return (
          <div style={{ background: barBg, padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'background 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#000', fontFamily: 'monospace', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isWarning && '⚠️'} {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:{String(Math.floor(remainingSeconds % 60)).padStart(2, '0')} left
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isFreeChat && (
                  <span style={{ color: '#000', fontWeight: 'bold', fontSize: '1rem', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px' }}>
                    Free Chat
                  </span>
                )}
                {!isFreeChat && (
                  <span style={{ color: '#000', fontFamily: 'monospace', fontSize: '1rem' }}>
                    ₹{Math.max(0, walletBalance - (elapsedSeconds / 60) * rate).toFixed(2)} in wallet
                  </span>
                )}
                {!isFreeChat && isWarning ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[50, 100, 200, 500].map(amt => (
                      <WalletPaymentButton 
                        key={amt}
                        amount={amt}
                        onSuccess={async (newBal) => {
                          setWalletBalance(newBal);
                          setLowBalanceWarning(false);
                          if (socketRef.current) {
                            socketRef.current.emit('wallet_recharged', { sessionId: session?._id || session?.sessionId || session?.id });
                          }
                        }}
                        customStyle={{ background: '#fff', color: '#f59e0b', border: 'none', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                        customText={`+₹${amt}`}
                      />
                    ))}
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowRechargeOverlay(true)}
                    style={{ background: '#fef08a', color: '#b45309', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    ⚡ Top up
                  </button>
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
          {(session?.chatId || session?.sessionId || session?._id) && (
            <div 
              onClick={() => setShowChatInfo(true)}
              style={{ cursor: 'pointer', background: '#2563eb', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Chat #{String(session?.chatId || session?.sessionId || session?._id).slice(-5)} <span style={{ fontSize: '14px' }} title="Click for chat details">ℹ️</span>
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
            style={{ display: 'flex', justifyContent: (m.sender || m.senderRole) === 'fan' ? 'flex-end' : ((m.sender || m.senderRole) === 'system' ? 'center' : 'flex-start'), position: 'relative' }}
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
                background: (m.sender || m.senderRole) === 'fan' ? theme.senderBubble : theme.receiverBubble,
                color: (m.sender || m.senderRole) === 'fan' ? theme.senderText : theme.receiverText,
                padding: '12px 18px',
                borderRadius: '16px',
                borderTopRightRadius: (m.sender || m.senderRole) === 'fan' ? '4px' : '16px',
                borderTopLeftRadius: (m.sender || m.senderRole) === 'fan' ? '16px' : '4px',
                maxWidth: '75%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                position: 'relative',
                display: 'inline-block'
              }}>
                {hoveredMessageId === m.messageId && (
                  <div style={{
                    position: 'absolute',
                    top: '-36px',
                    [(m.sender || m.senderRole) === 'fan' ? 'right' : 'left']: '0',
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
                            socketRef.current.emit('react_message', { messageId: m.messageId, sessionId: session.sessionId || session._id || session.id, emoji, senderRole: 'fan' });
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
                {(m.sender || m.senderRole) === 'fan' && (
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
                    [(m.sender || m.senderRole) === 'fan' ? 'right' : 'left']: '16px',
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
            <div style={{ background: '#fff', color: '#6b7280', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontStyle: 'italic', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#f0f0f0' }}>
        <div style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                position: 'absolute',
                left: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#9ca3af',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
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
              placeholder="Type a message..."
              style={{ width: '100%', background: '#fff', border: 'none', padding: '14px 20px 14px 44px', borderRadius: '24px', color: '#111', outline: 'none', fontSize: '15px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            onClick={sendMessage}
            style={{ background: 'transparent', color: '#6b7280', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        
        {showEmojiPicker && (
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

export default LiveChatInterface;

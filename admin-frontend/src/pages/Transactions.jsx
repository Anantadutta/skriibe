import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // For AMA dropdown
  const [chatMessages, setChatMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState({});
  const [modalChatId, setModalChatId] = useState(null); // For Chat Modal
  const [activeTab, setActiveTab] = useState('AMA'); // 'AMA' or 'LIVE Chats'
  const [liveChatSort, setLiveChatSort] = useState('latest'); // 'latest', 'oldest', 'price_high', 'duration_high'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/transactions`, { withCredentials: true });
        setTransactions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatTimeTaken = (start, end) => {
    if (!start || !end) return 'Pending';
    const diff = new Date(end) - new Date(start);
    if (isNaN(diff)) return 'Pending';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const openChatModal = async (t) => {
    if (!t || !t._id) return;
    const id = t._id;
    setModalChatId(id);
    if (!chatMessages[id]) {
      setLoadingMessages(prev => ({ ...prev, [id]: true }));
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/transactions/chat/${id}`, { withCredentials: true });
        setChatMessages(prev => ({ ...prev, [id]: Array.isArray(res.data) ? res.data : [] }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const toggleExpand = (t) => {
    if (!t) return;
    if (t.type === 'chat') {
      openChatModal(t);
    } else {
      setExpandedId(expandedId === t._id ? null : t._id);
    }
  };

  if (loading) {
    return <div style={{ padding: '32px 24px', color: '#fff' }}>Loading transactions...</div>;
  }

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const selectedChat = safeTransactions.find(t => t && t._id === modalChatId) || null;

  const filteredTransactions = safeTransactions.filter(t => {
    if (!t) return false;
    // Tab filter
    if (activeTab === 'AMA' && t.type !== 'ama') return false;
    if (activeTab === 'LIVE Chats' && t.type !== 'chat') return false;

    // Search filter
    if (!searchQuery) return true;
    const q = String(searchQuery || '').toLowerCase();
    const matchChatId = t.chatId && String(t.chatId).toLowerCase().includes(q);
    const matchId = t._id && String(t._id).toLowerCase().includes(q);
    return matchChatId || matchId;
  }).sort((a, b) => {
    if (!a || !b) return 0;
    if (activeTab !== 'LIVE Chats') return 0; // Backend default sort for AMA
    
    if (liveChatSort === 'oldest') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else if (liveChatSort === 'latest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (liveChatSort === 'price_high') {
      const priceA = Number(a.totalCost) || 0;
      const priceB = Number(b.totalCost) || 0;
      return priceB - priceA;
    } else if (liveChatSort === 'duration_high') {
      const durationA = Number(a.totalMinutes) || 0;
      const durationB = Number(b.totalMinutes) || 0;
      return durationB - durationA;
    }
    return 0;
  });

  return (
    <div style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 className="font-wide" style={{ margin: '0 0 8px 0', fontSize: '2rem', letterSpacing: '-0.03em' }}>Transactions</h1>
        <p style={{ margin: 0, color: '#94a3b8' }}>Monitor the flow of questions and payments between fans and creators.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#13131A', borderRadius: '12px', padding: '4px', width: '100%', border: '1px solid #1E1E2D', gap: '8px', marginBottom: '8px' }}>
        <div 
          onClick={() => { setActiveTab('AMA'); setSearchQuery(''); }}
          style={{ 
            flex: 1, textAlign: 'center', padding: '12px 16px', borderRadius: '8px', 
            background: activeTab === 'AMA' ? '#2A2A35' : 'transparent', 
            color: activeTab === 'AMA' ? '#fff' : '#64748b', 
            fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
          }}>
          AMA
        </div>
        <div 
          onClick={() => setActiveTab('LIVE Chats')}
          style={{ 
            flex: 1, textAlign: 'center', padding: '12px 16px', borderRadius: '8px', 
            background: activeTab === 'LIVE Chats' ? '#2A2A35' : 'transparent', 
            color: activeTab === 'LIVE Chats' ? '#fff' : '#64748b', 
            fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
          }}>
          LIVE Chats
        </div>
      </div>

      {/* Search Bar & Filters - Only for LIVE Chats */}
      {activeTab === 'LIVE Chats' && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by Chat ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '12px',
                padding: '14px 20px', color: '#fff', fontSize: '1rem', outline: 'none'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '12px',
                padding: '14px 20px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
              }}
            >
              Filter ▼
            </button>
            {showFilterDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '12px', width: '220px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                <div 
                  onClick={() => { setLiveChatSort('latest'); setShowFilterDropdown(false); }}
                  style={{ padding: '12px 16px', color: liveChatSort === 'latest' ? '#38BDF8' : '#fff', cursor: 'pointer', borderBottom: '1px solid #1E1E2D', background: liveChatSort === 'latest' ? 'rgba(56, 189, 248, 0.1)' : 'transparent' }}
                >
                  Latest to Oldest (Default)
                </div>
                <div 
                  onClick={() => { setLiveChatSort('oldest'); setShowFilterDropdown(false); }}
                  style={{ padding: '12px 16px', color: liveChatSort === 'oldest' ? '#38BDF8' : '#fff', cursor: 'pointer', borderBottom: '1px solid #1E1E2D', background: liveChatSort === 'oldest' ? 'rgba(56, 189, 248, 0.1)' : 'transparent' }}
                >
                  Oldest to Latest Date
                </div>
                <div 
                  onClick={() => { setLiveChatSort('price_high'); setShowFilterDropdown(false); }}
                  style={{ padding: '12px 16px', color: liveChatSort === 'price_high' ? '#38BDF8' : '#fff', cursor: 'pointer', borderBottom: '1px solid #1E1E2D', background: liveChatSort === 'price_high' ? 'rgba(56, 189, 248, 0.1)' : 'transparent' }}
                >
                  Highest to Lowest Price
                </div>
                <div 
                  onClick={() => { setLiveChatSort('duration_high'); setShowFilterDropdown(false); }}
                  style={{ padding: '12px 16px', color: liveChatSort === 'duration_high' ? '#38BDF8' : '#fff', cursor: 'pointer', background: liveChatSort === 'duration_high' ? 'rgba(56, 189, 248, 0.1)' : 'transparent' }}
                >
                  Highest to Lowest Duration
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredTransactions.map(t => {
          const isChat = t.type === 'chat';
          
          return (
            <div key={t._id || Math.random()} style={{ background: '#13131A', borderRadius: '16px', border: '1px solid #1E1E2D', overflow: 'hidden' }}>
              
              {/* Primary Question/Chat Row */}
              <div 
                onClick={() => toggleExpand(t)}
                style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: expandedId === t._id ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                  {/* Fan Info */}
                  <div style={{ width: '150px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Fan</div>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{t.buyerName || t.fanId?.name || 'Anonymous'}</div>
                    <div style={{ color: '#10B981', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '2px' }}>
                      ₹{isChat ? (t.totalCost ? Number(t.totalCost).toFixed(2) : '0.00') : (t.amountPaid || 0)}
                    </div>
                  </div>

                  <div style={{ color: '#334155' }}>→</div>

                  {/* Creator Info */}
                  <div style={{ width: '150px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Creator</div>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{t.creatorId?.name || t.handle || 'Unknown'}</div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>@{t.creatorId?.handle || t.handle || 'unknown'}</div>
                  </div>

                  {/* Time Taken / Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      {isChat ? 'Duration' : 'Time Taken'}
                    </div>
                    <div style={{ color: (t.answeredAt || t.endTime) ? '#fff' : '#f59e0b', fontWeight: '500' }}>
                      {isChat 
                        ? (t.totalMinutes ? `${Number(t.totalMinutes).toFixed(2)}m` : formatTimeTaken(t.startTime, t.endTime))
                        : formatTimeTaken(t.createdAt, t.answeredAt)}
                    </div>
                  </div>
                </div>

                {/* Status & Expand Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {isChat && (
                    <div style={{ background: '#2563eb', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                      CHAT #{t.chatId || 'OLD'}
                    </div>
                  )}
                  <div style={{ 
                    background: t.status === 'answered' || t.status === 'satisfied' || t.status === 'ended' ? 'rgba(16, 185, 129, 0.1)' : (t.status === 'expired' || t.status === 'flagged' || t.status === 'rejected') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                    color: t.status === 'answered' || t.status === 'satisfied' || t.status === 'ended' ? '#10B981' : (t.status === 'expired' || t.status === 'flagged' || t.status === 'rejected') ? '#EF4444' : '#F59E0B',
                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                  }}>
                    {t.status || 'UNKNOWN'}
                  </div>
                  {!isChat && Array.isArray(t.followUps) && t.followUps.length > 0 ? (
                    <div style={{ background: '#38BDF8', color: '#000', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {t.followUps.length} Follow-up{t.followUps.length > 1 ? 's' : ''}
                    </div>
                  ) : (
                    <div style={{ width: isChat ? '20px' : '80px' }}></div>
                  )}
                  
                  {isChat ? (
                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      OPEN
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', transform: expandedId === t._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ▼
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Content (Follow-ups & Answers only for AMAs) */}
              {!isChat && expandedId === t._id && (
                <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #1E1E2D', background: '#0a0a0f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', marginBottom: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <span>Original Question:</span>
                    <span>Asked: {t.createdAt ? new Date(t.createdAt).toLocaleString() : 'Unknown'}</span>
                  </div>
                  <div style={{ color: '#fff', fontStyle: 'italic', marginBottom: '16px' }}>"{t.questionText || ''}"</div>
                  
                  {t.answerText && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '12px', marginBottom: '16px', borderLeft: '4px solid #10B981' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#10B981', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>Answer:</span>
                        {t.answeredAt && <span>Answered: {new Date(t.answeredAt).toLocaleString()}</span>}
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.95rem' }}>
                        {t.answerText}
                      </div>
                    </div>
                  )}
                  
                  {Array.isArray(t.followUps) && t.followUps.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {t.followUps.map((f, index) => {
                        if (!f) return null;
                        return (
                          <div key={f._id || index} style={{ background: '#13131A', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #38BDF8' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ color: '#38BDF8', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Follow-up {index + 1}
                              </div>
                              <div style={{ color: f.answeredAt ? '#10B981' : '#F59E0B', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'right' }}>
                                <div>Time Taken: {formatTimeTaken(f.createdAt, f.answeredAt)}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '4px', fontWeight: 'normal' }}>
                                  Asked: {f.createdAt ? new Date(f.createdAt).toLocaleString() : 'Unknown'}
                                  {f.answeredAt && ` | Answered: ${new Date(f.answeredAt).toLocaleString()}`}
                                </div>
                              </div>
                            </div>
                            <div style={{ color: '#cbd5e1', fontStyle: 'italic' }}>"{f.questionText || ''}"</div>
                            {f.answerText && (
                              <div style={{ marginTop: '12px', color: '#fff', fontSize: '0.95rem', borderTop: '1px dashed #2A2A35', paddingTop: '12px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginRight: '8px' }}>A:</span>
                                {f.answerText}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}

        {filteredTransactions.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#13131A', borderRadius: '16px', border: '1px solid #1E1E2D' }}>
            No transactions found.
          </div>
        )}
      </div>

      {/* Chat Modal Overlay */}
      {modalChatId && selectedChat && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setModalChatId(null)}>
          <div 
            style={{ background: '#13131A', width: '100%', maxWidth: '600px', borderRadius: '16px', border: '1px solid #2A2A35', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #2A2A35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Chat Transcript</h2>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                  Started: {new Date(selectedChat.startTime || selectedChat.createdAt || 0).toLocaleString()}
                </div>
              </div>
              <button 
                onClick={() => setModalChatId(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', padding: '4px 8px' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body (Messages) */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '300px' }}>
              {loadingMessages[modalChatId] ? (
                <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>Loading messages...</div>
              ) : (!Array.isArray(chatMessages[modalChatId]) || chatMessages[modalChatId].length === 0) ? (
                <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>No messages in this chat.</div>
              ) : (
                chatMessages[modalChatId].map(m => {
                  if (!m) return null;
                  return (
                    <div key={m._id || Math.random()} style={{ display: 'flex', justifyContent: m.senderRole === 'creator' ? 'flex-end' : (m.senderRole === 'system' ? 'center' : 'flex-start') }}>
                      {m.senderRole === 'system' ? (
                        <div style={{ background: '#fff', color: '#000', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', margin: '4px 0' }}>
                          {m.content}
                        </div>
                      ) : (
                        <div style={{ 
                          background: m.senderRole === 'creator' ? '#dcf8c6' : '#334155', 
                          color: m.senderRole === 'creator' ? '#000' : '#fff',
                          padding: '10px 14px', borderRadius: '12px', 
                          borderTopRightRadius: m.senderRole === 'creator' ? '4px' : '12px',
                          borderTopLeftRadius: m.senderRole === 'creator' ? '12px' : '4px',
                          maxWidth: '85%', fontSize: '0.95rem' 
                        }}>
                          <div style={{ fontSize: '0.7rem', color: m.senderRole === 'creator' ? '#666' : '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            {m.senderRole === 'creator' ? (selectedChat.creatorId?.name || 'Creator') : (selectedChat.fanId?.name || 'Fan')}
                          </div>
                          <div style={{ lineHeight: '1.4' }}>{m.content}</div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
            
            {/* Modal Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #2A2A35', background: 'rgba(255,255,255,0.02)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem' }}>
                <span>Chat ID: {selectedChat.chatId || 'N/A'}</span>
                <span>Duration: {selectedChat.totalMinutes ? `${Number(selectedChat.totalMinutes).toFixed(2)}m` : 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;

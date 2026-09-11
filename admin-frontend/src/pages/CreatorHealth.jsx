import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const CreatorHealth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // All, Healthy, Critical
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewsModal, setShowReviewsModal] = useState(null);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/creators`, { withCredentials: true });
        setCreators(res.data);
      } catch (err) {
        console.error('Failed to fetch creators', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  useEffect(() => {
    if (!loading && location.state?.highlightCreatorId && creators.length > 0) {
      const el = document.getElementById(`creator-${location.state.highlightCreatorId}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Temporarily highlight the border
          const originalBorder = el.style.border;
          el.style.border = '2px solid #F59E0B';
          el.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.3)';
          setTimeout(() => {
            el.style.border = originalBorder;
            el.style.boxShadow = 'none';
          }, 3000);
        }, 100);
      }
    }
  }, [loading, creators, location.state]);

  const filteredCreators = creators.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.handle && c.handle.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const allCreators = filteredCreators;
  const healthy = filteredCreators.filter(c => c.calculatedStats?.healthStatus === 'Account Healthy');
  const critical = filteredCreators.filter(c => c.calculatedStats?.healthStatus !== 'Account Healthy');

  let currentList = [];
  if (activeTab === 'All') currentList = allCreators;
  else if (activeTab === 'Healthy') currentList = healthy;
  else if (activeTab === 'Critical') currentList = critical;

  const [expandedStrikeLogId, setExpandedStrikeLogId] = useState(null);

  const handleWarn = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/creators/${id}/warn`, {}, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      alert('Failed to issue warning');
    }
  };

  const handleSuspend = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/creators/${id}/suspend`, {}, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      alert('Failed to issue suspension');
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Creator Review</span>
        </div>
        <NotificationBell />
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Creator Review
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Monitor creator performance</div>
      </div>

      {/* Search Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '12px', padding: '12px 16px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search creators by name, handle, or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '0.95rem', width: '100%', outline: 'none' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#13131A', borderRadius: '12px', padding: '4px', width: '100%', border: '1px solid #1E1E2D', gap: '8px' }}>
        <div 
          onClick={() => setActiveTab('All')}
          style={{ 
            flex: 1, textAlign: 'center', padding: '12px 16px', borderRadius: '8px', 
            background: activeTab === 'All' ? '#2A2A35' : 'transparent', 
            color: activeTab === 'All' ? '#fff' : '#64748b', 
            fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
          }}>
          All ({allCreators.length})
        </div>
        <div 
          onClick={() => setActiveTab('Healthy')}
          style={{ 
            flex: 1, textAlign: 'center', padding: '12px 16px', borderRadius: '8px', 
            background: activeTab === 'Healthy' ? '#2A2A35' : 'transparent', 
            color: activeTab === 'Healthy' ? '#fff' : '#64748b', 
            fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
          }}>
          Healthy ({healthy.length})
        </div>
        <div 
          onClick={() => setActiveTab('Critical')}
          style={{ 
            flex: 1, textAlign: 'center', padding: '12px 16px', borderRadius: '8px', 
            background: activeTab === 'Critical' ? '#2A2A35' : 'transparent', 
            color: activeTab === 'Critical' ? '#fff' : '#64748b', 
            fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
          }}>
          Critical ({critical.length})
        </div>
      </div>

      <div style={{ color: activeTab === 'All' ? '#38BDF8' : activeTab === 'Healthy' ? '#10B981' : '#EF4444', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '1px', marginTop: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
        {activeTab}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : currentList.length === 0 ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', background: '#13131A', borderRadius: '16px', border: '1px dashed #1E1E2D' }}>
            No creators in this category.
          </div>
        ) : (
          currentList.map(creator => {
            const stats = creator.calculatedStats || { replyRate: 100, refundRate: 0, slaBreaches: 0 };
            
            // Dynamic colors based on stats
            const replyColor = stats.replyRate >= 80 ? '#10B981' : stats.replyRate >= 50 ? '#F59E0B' : '#EF4444';
            const refundColor = stats.refundRate <= 10 ? '#10B981' : stats.refundRate <= 20 ? '#F59E0B' : '#EF4444';
            const breachColor = stats.slaBreaches === 0 ? '#10B981' : stats.slaBreaches <= 2 ? '#F59E0B' : '#EF4444';

            return (
              <div id={`creator-${creator._id}`} key={creator._id} style={{ background: '#1C1510', border: '1px solid #332616', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'all 0.5s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1A4D3E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '900', border: '2px solid #236B56' }}>
                      {(creator.handle || creator.name || 'C')[0].toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{creator.name || 'No Name Provided'}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        @{creator.handle || 'unknown'} {creator.email && <span style={{ color: '#cbd5e1' }}>• {creator.email}</span>}{creator.phone && <span style={{ color: '#cbd5e1' }}> • {creator.phone}</span>}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>
                        Joined: {new Date(creator.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {' · '}Active since {Math.max(1, Math.floor((Date.now() - new Date(creator.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))} days
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div 
                      onClick={() => setExpandedStrikeLogId(expandedStrikeLogId === creator._id ? null : creator._id)}
                      style={{ 
                        background: stats.healthStatus === 'Permanently Removed' ? 'rgba(239, 68, 68, 0.1)' : stats.healthStatus === 'Account Healthy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        border: `1px solid ${stats.healthStatus === 'Permanently Removed' ? 'rgba(239, 68, 68, 0.2)' : stats.healthStatus === 'Account Healthy' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                        color: stats.healthStatus === 'Permanently Removed' ? '#EF4444' : stats.healthStatus === 'Account Healthy' ? '#10B981' : '#F59E0B',
                        padding: '6px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                      {stats.healthStatus}
                    </div>
                  </div>
                </div>

                {expandedStrikeLogId === creator._id && (
                  <div style={{ background: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid #1E1E2D', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Strike History Log</div>
                    {(!creator.strikes || creator.strikes.length === 0) ? (
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No strikes issued.</div>
                    ) : (
                      creator.strikes.sort((a,b) => new Date(a.date) - new Date(b.date)).map((strike, index) => (
                        <div key={index} style={{ color: strike.isExpired ? '#64748b' : '#E2E8F0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#F59E0B' }}>●</span> Strike {strike.strikeLevel} — {new Date(strike.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {strike.isExpired && <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.75rem', marginLeft: '4px' }}>— EXPIRED</span>}
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div style={{ background: '#15100C', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Rating</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill={star <= (stats.rating || 0) ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <div style={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '1.2rem', marginLeft: '8px' }}>
                    {stats.rating ? stats.rating.toFixed(1) : '0.0'}
                  </div>
                </div>

                {stats.fanReviews && stats.fanReviews.length > 0 && (
                  <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Fan Reviews</div>
                      {stats.fanReviews.length > 1 && (
                        <button 
                          onClick={() => setShowReviewsModal({ creator, reviews: stats.fanReviews })}
                          style={{ background: 'transparent', border: 'none', color: '#38BDF8', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                        >
                          View all
                        </button>
                      )}
                    </div>
                    {stats.fanReviews.slice(0, 1).map((review, idx) => (
                      <div key={idx} style={{ background: '#1A1A24', padding: '12px', borderRadius: '8px', border: '1px solid #2A2A35' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '0.85rem' }}>{review.fanName}</div>
                          <div style={{ color: '#F59E0B', fontSize: '0.8rem', fontWeight: 'bold' }}>★ {review.rating.toFixed(1)}</div>
                        </div>
                        {review.tags && review.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            {review.tags.map((tag, i) => (
                              <span key={i} style={{ background: '#2A2A35', color: '#94a3b8', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>{tag}</span>
                            ))}
                          </div>
                        )}
                        {review.feedback && <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>"{review.feedback}"</div>}
                        <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '6px' }}>{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Reviews Modal */}
      {showReviewsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#13131A', width: '90%', maxWidth: '500px', maxHeight: '80vh', borderRadius: '16px', border: '1px solid #1E1E2D', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #1E1E2D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                All Reviews for {showReviewsModal.creator.name}
              </div>
              <button 
                onClick={() => setShowReviewsModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {showReviewsModal.reviews.map((review, idx) => (
                <div key={idx} style={{ background: '#1A1A24', padding: '12px', borderRadius: '8px', border: '1px solid #2A2A35' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '0.85rem' }}>{review.fanName}</div>
                    <div style={{ color: '#F59E0B', fontSize: '0.8rem', fontWeight: 'bold' }}>★ {review.rating.toFixed(1)}</div>
                  </div>
                  {review.tags && review.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {review.tags.map((tag, i) => (
                        <span key={i} style={{ background: '#2A2A35', color: '#94a3b8', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {review.feedback && <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>"{review.feedback}"</div>}
                  <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '6px' }}>{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreatorHealth;

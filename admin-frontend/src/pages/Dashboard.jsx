import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSlaModal, setShowSlaModal] = useState(false);
  const [showRefundsModal, setShowRefundsModal] = useState(false);

  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [dateRange, setDateRange] = useState({
    startDate: getLocalDateString(),
    endDate: getLocalDateString()
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
          params: { startDate: dateRange.startDate, endDate: dateRange.endDate }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [dateRange]);

  if (loading) {
    return <div style={{ padding: 40, color: '#fff' }}>Loading Platform Pulse...</div>;
  }

  if (!data) {
    return <div style={{ padding: 40, color: '#ef4444' }}>Error: Could not load data. Ensure backend is running.</div>;
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Dashboard</span>
        </div>
        <NotificationBell />
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Platform pulse
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Live snapshot · skriibe ops</div>
      </div>

      {/* Top Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div 
          className="bg-card" 
          style={{ padding: '16px 20px 24px 20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}
        >
          {/* Date Filter Inside Card */}
          <div 
            style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#13131A', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '4px 8px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>From:</span>
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#13131A', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '4px 8px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>To:</span>
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="font-wide text-blue" style={{ fontSize: '2rem' }}>₹{data.gmvToday.toLocaleString()}</div>
          <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {dateRange.startDate === dateRange.endDate ? 'TOTAL AMOUNT INVOLVED TODAY' : 'TOTAL AMOUNT INVOLVED'}
          </div>
        </div>
        <div 
          className="bg-card" 
          style={{ padding: '16px 20px 24px 20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}
        >
          {/* Date Filter Inside Card */}
          <div 
            style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#13131A', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '4px 8px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>From:</span>
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#13131A', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '4px 8px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>To:</span>
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="font-wide text-green" style={{ fontSize: '2rem' }}>₹{data.revenue.toLocaleString()}</div>
          <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {dateRange.startDate === dateRange.endDate ? 'PROFIT TODAY' : 'PROFIT'}
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div 
          onClick={() => navigate('/admin/creators')}
          className="bg-card" 
          style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
        >
          <div className="font-wide" style={{ fontSize: '2rem', color: '#ffffff' }}>{data.activeCreators}</div>
          <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}>ACTIVE CREATORS</div>
        </div>
        <div 
          onClick={() => setShowSlaModal(true)}
          className="bg-card" 
          style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
        >
          <div className="font-wide text-red" style={{ fontSize: '2rem' }}>{data.slaBreaches}</div>
          <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}>SLA BREACHES</div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '8px 0' }} />

      {/* Action Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div 
          onClick={() => navigate('/admin/open-questions')}
          style={{ background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '12px', padding: '16px 12px', textAlign: 'center', cursor: 'pointer' }}
        >
          <div className="font-wide text-yellow" style={{ fontSize: '1.4rem' }}>{data.actionMetrics.openQuestions}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '4px' }}>Open questions →</div>
        </div>
        <div 
          onClick={() => setShowRefundsModal(true)}
          style={{ background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '12px', padding: '16px 12px', textAlign: 'center', cursor: 'pointer' }}
        >
          <div className="font-wide text-red" style={{ fontSize: '1.4rem' }}>{data.actionMetrics.refundsToday}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '4px' }}>Refunds till now →</div>
        </div>
      </div>

      {/* Removed Recent Activity section */}
      
      {/* SLA Modal */}
      {showSlaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#13131A', width: '90%', maxWidth: '600px', borderRadius: '16px', border: '1px solid #1E1E2D', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setShowSlaModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <h2 className="font-wide" style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>SLA Breaches (>{24}h Pending)</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, paddingLeft: '40px' }}>These questions have been paid for but not answered within 24 hours.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              {data.breachedQuestions && data.breachedQuestions.length > 0 ? (
                data.breachedQuestions.map(bq => (
                  <div key={bq._id} style={{ background: '#0F0F13', padding: '16px', borderRadius: '8px', border: '1px solid #2A2A35' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ color: '#fff', fontWeight: 'bold' }}>To: {bq.creatorId?.name || 'Unknown'} (@{bq.creatorId?.handle || 'unknown'})</div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ color: '#10B981', fontWeight: 'bold' }}>₹{bq.amountPaid || 0}</div>
                        <div style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 'bold' }}>{Math.floor((new Date() - new Date(bq.createdAt)) / (1000 * 60 * 60))}h Overdue</div>
                      </div>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>From: {bq.fanId?.name || bq.buyerName || 'Anonymous Buyer'}</div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontStyle: 'italic', background: '#1a1a24', padding: '8px', borderRadius: '4px' }}>
                      "{bq.questionText}"
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No active SLA breaches! 🚀</div>
              )}
            </div>

            <button 
              onClick={() => setShowSlaModal(false)}
              style={{ background: '#2A2A35', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Refunds Modal */}
      {showRefundsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#13131A', width: '90%', maxWidth: '600px', borderRadius: '16px', border: '1px solid #1E1E2D', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setShowRefundsModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <h2 className="font-wide" style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Refunds Till Now</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, paddingLeft: '40px' }}>These questions were resolved as refunds till now.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              {data.adminRefundsData && data.adminRefundsData.length > 0 ? (
                data.adminRefundsData.map(rq => (
                  <div key={rq._id} style={{ background: '#0F0F13', padding: '16px', borderRadius: '8px', border: '1px solid #2A2A35' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ color: '#fff', fontWeight: 'bold' }}>Buyer: {rq.buyerName || rq.fanId?.name || 'Anonymous'}</div>
                      <div style={{ color: '#10B981', fontWeight: 'bold' }}>₹{rq.amountPaid || 0}</div>
                    </div>
                    
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>
                      Creator: <span style={{ color: '#cbd5e1' }}>{rq.creatorId?.name || 'Unknown'} (@{rq.creatorId?.handle || 'unknown'})</span>
                    </div>

                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '12px' }}>
                      Admin Decision: <span style={{ color: rq.adminDecision === 'fan_wins' ? '#EF4444' : '#38bdf8', fontWeight: 'bold' }}>
                        {rq.adminDecision === 'fan_wins' ? 'Full Refund to Buyer' : (rq.adminDecision === 'creator_wins' ? 'No Refund (Creator Wins)' : rq.adminDecision || 'Unknown')}
                      </span>
                    </div>

                    <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontStyle: 'italic', background: '#1a1a24', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>QUESTION</span>
                      "{rq.questionText}"
                    </div>
                    {rq.answerText ? (
                      <div style={{ color: '#e2e8f0', fontSize: '0.9rem', background: '#1a1a24', padding: '8px', borderRadius: '4px' }}>
                        <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>ANSWER</span>
                        {rq.answerText}
                      </div>
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>No answer provided.</div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No refunds issued till now.</div>
              )}
            </div>

            <button 
              onClick={() => setShowRefundsModal(false)}
              style={{ background: '#2A2A35', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

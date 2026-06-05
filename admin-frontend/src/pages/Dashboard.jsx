import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
            {dateRange.startDate === dateRange.endDate ? 'REVENUE TODAY' : 'REVENUE'}
          </div>
        </div>
        <div 
          className="bg-card" 
          style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <div className="font-wide text-green" style={{ fontSize: '2rem' }}>₹{data.revenue.toLocaleString()}</div>
          <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}>PROFIT</div>
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
          onClick={() => navigate('/admin/alerts')}
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
        <div style={{ background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '12px', padding: '16px 12px', textAlign: 'center' }}>
          <div className="font-wide text-red" style={{ fontSize: '1.4rem' }}>{data.actionMetrics.refundsToday}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '4px' }}>Refunds today →</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Recent activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div 
            className="bg-card-dark" 
            style={{ padding: '16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onClick={() => navigate('/admin/dispute/1234')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f8fafc' }}>Auto-refund triggered · Q#1234 · SLA breach</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tap to review dispute · 2 min ago</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '1rem' }}>›</div>
          </div>

          <div 
            className="bg-card-dark" 
            style={{ padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f8fafc' }}>@priya_fit verified and activated</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>5 min ago</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '1rem' }}>›</div>
          </div>

          <div 
            className="bg-card-dark" 
            style={{ padding: '16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onClick={() => navigate('/admin/verification')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f8fafc' }}>New creator signup · @rohan_biz · pending review</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tap to open verification queue</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '1rem' }}>›</div>
          </div>

          <div 
            className="bg-card-dark" 
            style={{ padding: '16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onClick={() => navigate('/admin/dispute/1235')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f8fafc' }}>Dispute #1235 resolved by admin</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>12 min ago</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

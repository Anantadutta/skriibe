import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const Tips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('date');

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/tips`, { withCredentials: true });
        setTips(res.data);
      } catch (err) {
        console.error('Failed to fetch tips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  const filteredTips = tips.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.fanId?.name && t.fanId.name.toLowerCase().includes(q)) ||
      (t.creatorId?.name && t.creatorId.name.toLowerCase().includes(q)) ||
      (t.creatorId?.handle && t.creatorId.handle.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    if (sortOrder === 'amount_desc') {
      return Number(b.amount) - Number(a.amount);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Tips</span>
        </div>
        <NotificationBell />
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Tips Overview
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Monitor tips given to creators by their fans.</div>
      </div>

      <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by fan or creator name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '12px',
              padding: '14px 20px', color: '#fff', fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
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
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '12px',
            padding: '14px 20px', color: '#fff', fontSize: '1rem', outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="date">Latest First</option>
          <option value="amount_desc">Highest Tip</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
        {loading ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>Loading tips...</div>
        ) : filteredTips.length === 0 ? (
          <div style={{ background: '#13131A', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8', border: '1px solid #1E1E2D' }}>
            No tips found.
          </div>
        ) : (
          filteredTips.map((tip) => (
            <div key={tip._id} style={{ background: '#13131A', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{tip.fanId?.name || 'Anonymous Fan'}</span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>tipped</span>
                  <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1rem' }}>{tip.creatorId?.name || tip.creatorId?.handle || 'Unknown Creator'}</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>{new Date(tip.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span>•</span>
                  <span>{new Date(tip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ color: '#10B981', fontSize: '1.25rem', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '12px' }}>
                  ₹{Number(tip.amount).toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Tips;

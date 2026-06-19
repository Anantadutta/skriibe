import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/alerts`, { withCredentials: true });
        setAlerts(res.data);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/alerts/mark-read`, { ids: [id] }, { withCredentials: true });
      setAlerts(alerts.map(a => a._id === id ? { ...a, isRead: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/alerts/mark-read`, { ids: [] }, { withCredentials: true });
      setAlerts(alerts.map(a => ({ ...a, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAlertClick = (alert) => {
    if (!alert.isRead) handleMarkAsRead(alert._id);
    
    switch (alert.type) {
      case 'buyer_flag':
        navigate('/admin/dispute/' + alert.referenceId);
        break;
      case 'creator_reject':
      case 'creator_flag':
        navigate('/admin/creator-dispute/' + alert.referenceId);
        break;
      case 'creator_signup':
        navigate('/admin/creators');
        break;
      case 'fan_signup':
        navigate('/admin/buyers');
        break;
      default:
        break;
    }
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const getAlertIcon = (type) => {
    switch(type) {
      case 'creator_signup': return { icon: 'N', bg: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8' };
      case 'fan_signup': return { icon: 'F', bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
      case 'creator_reject': return { icon: '⚠', bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' };
      case 'creator_flag': return { icon: '🚩', bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
      case 'buyer_flag': return { icon: '🚩', bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
      case 'payout_ready': return { icon: '💰', bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' };
      default: return { icon: '🔔', bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' };
    }
  };

  const formatTime = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Alerts/Notifications</span>
        </div>
        <div 
          onClick={() => navigate('/admin/alerts')}
          style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
        >
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
          {unreadCount > 0 && (
            <div style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #13131A' }}>
              {unreadCount}
            </div>
          )}
        </div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
            Admin alerts/notifications
          </h1>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Your inbox — flagged questions, disputes, payouts & signups land here</div>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} style={{ background: 'transparent', color: '#38BDF8', border: 'none', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#13131A', borderRadius: '12px', padding: '4px', width: 'fit-content', border: '1px solid #1E1E2D' }}>
        <div 
          onClick={() => setFilter('all')}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '8px', 
            background: filter === 'all' ? '#2A2A35' : 'transparent', 
            color: filter === 'all' ? '#fff' : '#94a3b8', 
            fontSize: '0.85rem', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          All ({alerts.length})
        </div>
        <div 
          onClick={() => setFilter('unread')}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '8px', 
            background: filter === 'unread' ? '#2A2A35' : 'transparent', 
            color: filter === 'unread' ? '#fff' : '#94a3b8', 
            fontSize: '0.85rem', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Unread ({unreadCount})
        </div>
      </div>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading alerts...</div>
        ) : alerts.filter(a => filter === 'all' || !a.isRead).length === 0 ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', background: '#13131A', borderRadius: '16px', border: '1px dashed #1E1E2D' }}>No {filter === 'unread' ? 'unread ' : ''}alerts yet.</div>
        ) : (
          alerts.filter(a => filter === 'all' || !a.isRead).map(alert => {
            const styleInfo = getAlertIcon(alert.type);
            return (
              <div 
                key={alert._id}
                onClick={() => handleAlertClick(alert)}
                style={{ 
                  background: alert.isRead ? '#13131A' : 'rgba(56, 189, 248, 0.03)', 
                  borderRadius: '16px', 
                  padding: '16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  border: alert.isRead ? '1px solid #1E1E2D' : '1px solid rgba(56, 189, 248, 0.3)', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: styleInfo.bg, color: styleInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, fontWeight: 'bold' }}>
                    {styleInfo.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ color: alert.isRead ? '#cbd5e1' : '#fff', fontWeight: alert.isRead ? 'normal' : 'bold', fontSize: '0.95rem' }}>{alert.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{alert.message}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{formatTime(alert.createdAt)}</div>
                  {alert.type === 'payout_ready' && !alert.isRead && (
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/creators/${alert.referenceId}/mark-paid`, {}, { withCredentials: true });
                          handleMarkAsRead(alert._id);
                          alert('Earnings successfully marked as Paid.');
                        } catch (err) {
                          alert('Failed to mark as paid');
                        }
                      }}
                      style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22C55E', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', padding: '4px 12px', borderRadius: '6px', marginTop: '4px' }}
                    >
                      Mark Paid
                    </button>
                  )}
                  {alert.type !== 'payout_ready' && !alert.isRead && (
                    <button 
                      onClick={(e) => handleMarkAsRead(alert._id, e)}
                      style={{ background: 'transparent', border: 'none', color: '#38BDF8', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default AdminAlerts;

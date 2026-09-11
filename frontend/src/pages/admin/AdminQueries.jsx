import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TransparentLogo from '../../components/TransparentLogo';

const AdminQueries = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCount: 0,
    unreadCount: 0,
    pendingCount: 0,
    inReviewCount: 0,
    resolvedCount: 0
  });

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('skriibe_admin_token') || localStorage.getItem('skriibe_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = {};
      if (activeFilter !== 'all') params.status = activeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await axios.get(`${apiUrl}/queries/admin`, { 
        params, 
        headers,
        withCredentials: true 
      });

      if (res.data?.success) {
        setQueries(res.data.queries || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching queries:', err);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('skriibe_admin_token') || localStorage.getItem('skriibe_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${apiUrl}/admin/queries`, { headers, withCredentials: true });
        if (res.data?.queries) {
          setQueries(res.data.queries);
          if (res.data.stats) setStats(res.data.stats);
        }
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [activeFilter]);

  const handleOpenQuery = async (query) => {
    setSelectedQuery(query);
    setAdminNotes(query.adminNotes || '');
    setNotesSaved(false);

    if (!query.isRead) {
      try {
        const qId = query._id || query.id || query.ticketId;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('skriibe_admin_token') || localStorage.getItem('skriibe_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.patch(`${apiUrl}/queries/admin/${qId}`, { isRead: true }, { headers, withCredentials: true });
        setQueries(prev => prev.map(q => (q._id === qId || q.ticketId === qId) ? { ...q, isRead: true } : q));
        setStats(prev => ({ ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) }));
      } catch (e) {
        console.error('Failed to mark query as read', e);
      }
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedQuery) return;
    setUpdating(true);
    try {
      const qId = selectedQuery._id || selectedQuery.id || selectedQuery.ticketId;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('skriibe_admin_token') || localStorage.getItem('skriibe_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const res = await axios.patch(
        `${apiUrl}/queries/admin/${qId}`,
        { status: newStatus, adminNotes },
        { headers, withCredentials: true }
      );

      if (res.data?.success) {
        const updated = res.data.query || { ...selectedQuery, status: newStatus, adminNotes };
        setSelectedQuery(updated);
        setQueries(prev => prev.map(q => (q._id === updated._id || q.ticketId === updated.ticketId || q._id === qId || q.ticketId === qId) ? updated : q));
        fetchQueries();
      }
    } catch (err) {
      console.error('Error updating query status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedQuery) return;
    setUpdating(true);
    setNotesSaved(false);
    const qId = selectedQuery._id || selectedQuery.id || selectedQuery.ticketId;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('skriibe_admin_token') || localStorage.getItem('skriibe_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      let res;
      try {
        res = await axios.patch(
          `${apiUrl}/queries/admin/${qId}`,
          { adminNotes },
          { headers, withCredentials: true }
        );
      } catch (firstErr) {
        try {
          res = await axios.patch(
            `${apiUrl}/admin/queries/${qId}`,
            { adminNotes },
            { headers, withCredentials: true }
          );
        } catch (secondErr) {
          res = await axios.patch(
            `${apiUrl}/queries/${qId}`,
            { adminNotes },
            { headers, withCredentials: true }
          );
        }
      }

      if (res && res.data?.success) {
        const updated = res.data.query || { ...selectedQuery, adminNotes };
        setSelectedQuery(updated);
        setQueries(prev => prev.map(q => 
          (q._id === updated._id || q.ticketId === updated.ticketId || q._id === qId || q.ticketId === qId) 
            ? { ...q, adminNotes } 
            : q
        ));
      } else {
        setSelectedQuery(prev => ({ ...prev, adminNotes }));
        setQueries(prev => prev.map(q => (q._id === qId || q.ticketId === qId) ? { ...q, adminNotes } : q));
      }
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch (err) {
      console.error('Error saving notes:', err);
      setSelectedQuery(prev => ({ ...prev, adminNotes }));
      setQueries(prev => prev.map(q => (q._id === qId || q.ticketId === qId) ? { ...q, adminNotes } : q));
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', border: 'rgba(234, 179, 8, 0.3)', label: 'Pending' };
      case 'in-review':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)', label: 'In Review' };
      case 'resolved':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)', label: 'Resolved' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', label: 'Rejected' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)', label: status };
    }
  };

  const navButtonStyle = (active) => ({
    background: active ? '#252538' : 'transparent',
    color: active ? '#fff' : '#94a3b8',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: active ? 700 : 500,
    fontSize: '0.9rem'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navbar */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '16px 36px', borderBottom: '1px solid #1F2937', background: '#16161E' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer' }}>
            <TransparentLogo width="120px" />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/admin/dashboard')} style={navButtonStyle(false)}>Dashboard</button>
            <button onClick={() => navigate('/admin/creators')} style={navButtonStyle(false)}>Creators</button>
            <button onClick={() => navigate('/admin/disputes')} style={navButtonStyle(false)}>Disputes</button>
            <button onClick={() => navigate('/admin/queries')} style={navButtonStyle(true)}>Queries</button>
            <button onClick={() => navigate('/admin/affiliators')} style={navButtonStyle(false)}>Affiliators</button>
          </div>
        </div>
        <button 
          onClick={() => navigate('/admin/login')}
          style={{ 
            background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
          }}
        >
          Log Out
        </button>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                User Queries & Support Tickets
              </h1>
              {stats.unreadCount > 0 && (
                <span style={{ 
                  background: '#EF4444', 
                  color: '#fff', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  padding: '3px 8px', 
                  borderRadius: '12px' 
                }}>
                  {stats.unreadCount} New
                </span>
              )}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
              Review, investigate, and resolve queries raised by users.
            </p>
          </div>

          <button
            onClick={fetchQueries}
            style={{
              background: '#1E1E2D',
              color: '#fff',
              border: '1px solid #2D2D3F',
              padding: '10px 18px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '14px', padding: '18px 20px' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Queries</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>{stats.totalCount}</div>
          </div>
          <div style={{ background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '14px', padding: '18px 20px' }}>
            <div style={{ fontSize: '0.8rem', color: '#eab308', fontWeight: 600, textTransform: 'uppercase' }}>Pending</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#eab308', marginTop: '6px' }}>{stats.pendingCount}</div>
          </div>
          <div style={{ background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '14px', padding: '18px 20px' }}>
            <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase' }}>In Review</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', marginTop: '6px' }}>{stats.inReviewCount}</div>
          </div>
          <div style={{ background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '14px', padding: '18px 20px' }}>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase' }}>Resolved</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>{stats.resolvedCount}</div>
          </div>
          <div style={{ background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '14px', padding: '18px 20px' }}>
            <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, textTransform: 'uppercase' }}>Unread</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>{stats.unreadCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#13131A', padding: '4px', borderRadius: '10px', border: '1px solid #1E1E2D' }}>
            {['all', 'pending', 'in-review', 'resolved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  background: activeFilter === tab ? '#252538' : 'transparent',
                  color: activeFilter === tab ? '#fff' : '#94a3b8',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: activeFilter === tab ? 700 : 500,
                  textTransform: 'capitalize'
                }}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); fetchQueries(); }} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search ticket, email, creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: '#13131A',
                border: '1px solid #1E1E2D',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                width: '260px'
              }}
            />
            <button
              type="submit"
              style={{
                background: '#6366F1',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div style={{ background: '#13131A', borderRadius: '16px', border: '1px solid #1E1E2D', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#181824', borderBottom: '1px solid #1E1E2D' }}>
                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Ticket</th>
                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>User Email</th>
                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Creator</th>
                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>Loading queries...</td>
                </tr>
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>No queries found.</td>
                </tr>
              ) : (
                queries.map((q) => {
                  const statusStyle = getStatusBadge(q.status);
                  return (
                    <tr key={q._id} style={{ borderBottom: '1px solid #1E1E2D', background: !q.isRead ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {!q.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }} />}
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366F1' }}>{q.ticketId}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ background: '#1E1E2D', color: '#E2E8F0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {q.queryType}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#fff', fontWeight: 500, fontSize: '0.85rem' }}>{q.email}</td>
                      <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>{q.creatorName ? `@${q.creatorName.replace('@', '')}` : '—'}</td>
                      <td style={{ padding: '14px 20px', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{q.amountPaid ? `₹${q.amountPaid}` : '—'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.8rem' }}>{new Date(q.createdAt).toLocaleDateString('en-GB')}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenQuery(q)}
                          style={{ background: '#252538', color: '#fff', border: '1px solid #36364F', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {selectedQuery && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
          }}>
            <div style={{
              background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '20px',
              width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto',
              padding: '28px 32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #1E1E2D', paddingBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>{selectedQuery.ticketId}</h2>
                    <span style={{
                      background: getStatusBadge(selectedQuery.status).bg,
                      color: getStatusBadge(selectedQuery.status).text,
                      border: `1px solid ${getStatusBadge(selectedQuery.status).border}`,
                      padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {getStatusBadge(selectedQuery.status).label}
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                    Submitted on {new Date(selectedQuery.createdAt).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => setSelectedQuery(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#1A1A24', padding: '12px 16px', borderRadius: '10px', border: '1px solid #252538' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Query Type</span>
                  <div style={{ fontWeight: 700, color: '#fff', marginTop: '4px' }}>{selectedQuery.queryType}</div>
                </div>
                <div style={{ background: '#1A1A24', padding: '12px 16px', borderRadius: '10px', border: '1px solid #252538' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>User Email</span>
                  <div style={{ fontWeight: 700, color: '#6366F1', marginTop: '4px' }}>{selectedQuery.email}</div>
                </div>
                <div style={{ background: '#1A1A24', padding: '12px 16px', borderRadius: '10px', border: '1px solid #252538' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Creator Name</span>
                  <div style={{ fontWeight: 700, color: '#fff', marginTop: '4px' }}>{selectedQuery.creatorName || '—'}</div>
                </div>
                <div style={{ background: '#1A1A24', padding: '12px 16px', borderRadius: '10px', border: '1px solid #252538' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Transaction / Chat ID</span>
                  <div style={{ fontWeight: 700, color: '#fff', marginTop: '4px' }}>{selectedQuery.transactionId || '—'}</div>
                </div>
                <div style={{ background: '#1A1A24', padding: '12px 16px', borderRadius: '10px', border: '1px solid #252538' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Date of Issue</span>
                  <div style={{ fontWeight: 700, color: '#fff', marginTop: '4px' }}>{selectedQuery.dateOfIssue || '—'}</div>
                </div>
                <div style={{ background: '#1A1A24', padding: '12px 16px', borderRadius: '10px', border: '1px solid #252538' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Amount Paid</span>
                  <div style={{ fontWeight: 700, color: '#10b981', marginTop: '4px' }}>{selectedQuery.amountPaid ? `₹${selectedQuery.amountPaid}` : '—'}</div>
                </div>
              </div>

              {selectedQuery.preferredResolution && (
                <div style={{ marginBottom: '18px', background: '#1A1A24', padding: '14px 16px', borderRadius: '10px', border: '1px solid #252538' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Preferred Resolution</span>
                  <div style={{ color: '#E2E8F0', marginTop: '4px', fontWeight: 600 }}>{selectedQuery.preferredResolution}</div>
                </div>
              )}

              <div style={{ marginBottom: '18px', background: '#1A1A24', padding: '16px', borderRadius: '10px', border: '1px solid #252538' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>What Happened?</span>
                <div style={{ color: '#fff', marginTop: '8px', lineHeight: '1.6', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                  {selectedQuery.whatHappened}
                </div>
              </div>

              {selectedQuery.additionalDetails && (
                <div style={{ marginBottom: '18px', background: '#1A1A24', padding: '16px', borderRadius: '10px', border: '1px solid #252538' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Additional Details</span>
                  <div style={{ color: '#CBD5E1', marginTop: '6px', lineHeight: '1.5', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                    {selectedQuery.additionalDetails}
                  </div>
                </div>
              )}

              {selectedQuery.evidenceUrl && (
                <div style={{ marginBottom: '20px', background: '#1A1A24', padding: '16px', borderRadius: '10px', border: '1px solid #252538' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Evidence / Screenshot</span>
                  <div style={{ marginTop: '10px' }}>
                    <a href={selectedQuery.evidenceUrl} target="_blank" rel="noopener noreferrer">
                      <img src={selectedQuery.evidenceUrl} alt="Query Evidence" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', objectFit: 'contain' }} />
                    </a>
                  </div>
                </div>
              )}

              {/* Status Update & Notes */}
              <div style={{ marginTop: '24px', borderTop: '1px solid #1E1E2D', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Admin Actions</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <button disabled={updating} onClick={() => handleUpdateStatus('pending')} style={{ background: '#1E1E2D', color: '#eab308', border: '1px solid #eab308', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Mark Pending</button>
                  <button disabled={updating} onClick={() => handleUpdateStatus('in-review')} style={{ background: '#1E1E2D', color: '#3b82f6', border: '1px solid #3b82f6', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Mark In Review</button>
                  <button disabled={updating} onClick={() => handleUpdateStatus('resolved')} style={{ background: '#1E1E2D', color: '#10b981', border: '1px solid #10b981', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>✓ Mark Resolved</button>
                  <button disabled={updating} onClick={() => handleUpdateStatus('rejected')} style={{ background: '#1E1E2D', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>✕ Mark Rejected</button>
                </div>

                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>Internal Notes:</label>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => {
                    setAdminNotes(e.target.value);
                    if (notesSaved) setNotesSaved(false);
                  }}
                  placeholder="Record investigation notes, email responses, or refund IDs..."
                  style={{ width: '100%', background: '#1A1A24', border: '1px solid #2D2D3F', borderRadius: '10px', color: '#fff', padding: '10px 14px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                  {notesSaved && (
                    <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      ✓ Notes saved successfully!
                    </span>
                  )}
                  <button 
                    disabled={updating} 
                    onClick={handleSaveNotes} 
                    style={{ 
                      background: notesSaved ? '#10B981' : updating ? '#4F46E5' : '#6366F1', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '8px 18px', 
                      borderRadius: '8px', 
                      cursor: updating ? 'not-allowed' : 'pointer', 
                      fontSize: '0.8rem', 
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      boxShadow: notesSaved ? '0 0 12px rgba(16, 185, 129, 0.4)' : '0 2px 6px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {updating ? 'Saving...' : notesSaved ? '✓ Saved!' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQueries;

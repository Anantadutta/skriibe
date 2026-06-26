import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DeletionPauseReasons = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/account-actions`, { withCredentials: true });
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch account actions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return <div style={{ padding: '32px 24px', color: '#fff' }}>Loading actions...</div>;
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="font-wide" style={{ margin: '0 0 8px 0', fontSize: '2rem', letterSpacing: '-0.03em' }}>Account Actions</h1>
        <p style={{ margin: 0, color: '#94a3b8' }}>Reasons provided for account deletions and pauses.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {logs.map(log => (
          <div key={log._id} style={{ background: '#13131A', borderRadius: '16px', border: '1px solid #1E1E2D', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  background: log.action === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: log.action === 'delete' ? '#ef4444' : '#f59e0b',
                  padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                }}>
                  {log.action}
                </div>
                <div style={{ 
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                }}>
                  {log.userType}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Name</div>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>{log.userName}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Email</div>
                <div style={{ color: '#cbd5e1' }}>{log.userEmail}</div>
              </div>
            </div>

            <div style={{ background: '#0a0a0f', padding: '16px', borderRadius: '12px', border: '1px solid #1E1E2D' }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reason Provided</div>
              <div style={{ color: '#fff', fontStyle: 'italic', lineHeight: '1.5' }}>"{log.reason}"</div>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#13131A', borderRadius: '16px', border: '1px solid #1E1E2D' }}>
            No account actions logged yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletionPauseReasons;

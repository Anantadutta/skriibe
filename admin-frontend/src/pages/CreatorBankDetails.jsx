import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const CreatorBankDetails = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div style={{ padding: 40, color: '#fff' }}>Loading bank details...</div>;
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Bank Details</span>
        </div>
        <NotificationBell />
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Creator Bank Details
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Monitor bank account setups for all creators</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        {creators.map(creator => {
          const hasBankDetails = creator.bankLinked && creator.bankAccountNumber;

          return (
            <div 
              key={creator._id} 
              style={{ 
                background: '#13131A', 
                borderRadius: '12px', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column',
                gap: '12px',
                border: hasBankDetails ? '1px solid #1E1E2D' : '1px solid #EF4444'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {creator.avatarUrl ? (
                    <img src={creator.avatarUrl} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#2A2A35', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                      {creator.name ? creator.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{creator.name || 'Unnamed Creator'}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>@{creator.handle}</div>
                  </div>
                </div>

                {!hasBankDetails && (
                  <div style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
                    Setup Pending
                  </div>
                )}
                {hasBankDetails && (
                  <div style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
                    Linked
                  </div>
                )}
              </div>

              {/* Bank Details section */}
              {hasBankDetails ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: '#0F0F13', padding: '16px', borderRadius: '8px', border: '1px solid #2A2A35', marginTop: '4px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Account Name</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{creator.bankAccountName || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Account Number</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', letterSpacing: '1px' }}>{creator.bankAccountNumber || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>IFSC Code</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', letterSpacing: '1px' }}>{creator.bankIfsc || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#EF4444', fontSize: '0.85rem', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', textAlign: 'center', fontStyle: 'italic' }}>
                  This creator has not provided their bank account details yet. Payouts cannot be processed.
                </div>
              )}
            </div>
          );
        })}
        {creators.length === 0 && !loading && (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>No creators found.</div>
        )}
      </div>
    </div>
  );
};

export default CreatorBankDetails;

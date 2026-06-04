import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreatorHealth = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/creators', { withCredentials: true });
        setCreators(res.data);
      } catch (err) {
        console.error('Failed to fetch creators', err);
      }
    };
    fetchCreators();
  }, []);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Creators</span>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
        </div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          All Creators
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Monitor all signed up creators</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {creators.map((creator) => {
          const isExpanded = expandedId === creator._id;
          return (
            <div 
              key={creator._id} 
              onClick={() => setExpandedId(isExpanded ? null : creator._id)}
              style={{ 
                background: '#13131A', 
                borderRadius: '16px', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                border: isExpanded ? '1px solid #38BDF8' : '1px solid #1E1E2D',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, fontWeight: 'bold' }}>
                    {(creator.handle || creator.email || 'C')[0].toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>@{creator.handle || 'No Handle'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{creator.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <div style={{ color: creator.verified ? '#10B981' : '#F59E0B', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {creator.verified ? 'Verified' : 'Pending'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>₹{creator.price}</div>
                </div>
              </div>

              {/* Expanded details section */}
              {isExpanded && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #1E1E2D', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>FULL NAME</div>
                      <div style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{creator.name || 'Not provided'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>PHONE</div>
                      <div style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{creator.phone || 'Not provided'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>BIO</div>
                    <div style={{ color: '#f8fafc', fontSize: '0.9rem', lineHeight: '1.4' }}>{creator.bio || 'No bio provided'}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>REPLY RATE</div>
                      <div style={{ color: '#10B981', fontSize: '0.9rem', fontWeight: 'bold' }}>{creator.stats?.replyRate || 0}%</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>ANSWERED</div>
                      <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 'bold' }}>{creator.stats?.totalAnswered || 0}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>STATUS</div>
                      <div style={{ color: creator.isLive ? '#10B981' : '#EF4444', fontSize: '0.9rem', fontWeight: 'bold' }}>{creator.isLive ? 'Live' : 'Offline'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {creator.expertise && creator.expertise.length > 0 && creator.expertise.map((exp, idx) => (
                      <div key={idx} style={{ background: '#1E1E2D', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', color: '#94a3b8' }}>
                        {exp}
                      </div>
                    ))}
                    {(!creator.expertise || creator.expertise.length === 0) && (
                      <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>No expertise listed</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: creator.bankLinked ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1rem' }}>{creator.bankLinked ? '✅' : '❌'}</span> Bank Linked
                    </div>
                    <div style={{ fontSize: '0.85rem', color: creator.instagramLinked || creator.instagramConnected ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1rem' }}>{creator.instagramLinked || creator.instagramConnected ? '✅' : '❌'}</span> Instagram Linked
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
        {creators.length === 0 && (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>No creators found.</div>
        )}
      </div>

    </div>
  );
};

export default CreatorHealth;

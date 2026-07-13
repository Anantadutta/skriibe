import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TransparentLogo from '../../components/TransparentLogo';

const AdminAffiliators = () => {
  const navigate = useNavigate();
  const [affiliators, setAffiliators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliator, setSelectedAffiliator] = useState(null);

  useEffect(() => {
    fetchAffiliators();
  }, []);

  const fetchAffiliators = async () => {
    try {
      const res = await api.get('/admin/affiliators');
      if (res.data.success) {
        setAffiliators(res.data.affiliators || []);
      }
    } catch (err) {
      console.error('Error fetching affiliators', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0E0E0E', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '20px 40px', borderBottom: '1px solid #1F2937', background: '#16161E' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer' }}>
            <TransparentLogo width="120px" />
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => navigate('/admin/dashboard')} style={navButtonStyle(false)}>Dashboard</button>
            <button onClick={() => navigate('/admin/creators')} style={navButtonStyle(false)}>Creators</button>
            <button onClick={() => navigate('/admin/disputes')} style={navButtonStyle(false)}>Disputes</button>
            <button style={navButtonStyle(true)}>Affiliators</button>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
          }}
        >
          Log Out
        </button>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '24px' }}>Affiliate Network</h1>
        
        <div style={{ background: '#16161E', borderRadius: '16px', border: '1px solid #1F2937', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1A1C23', borderBottom: '1px solid #1F2937' }}>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: 600 }}>Affiliator</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: 600 }}>Handle</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: 600 }}>Total Referrals</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading affiliators...</td></tr>
              ) : affiliators.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No affiliators found.</td></tr>
              ) : (
                affiliators.map(affiliator => (
                  <tr key={affiliator._id} style={{ borderBottom: '1px solid #1F2937' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', background: '#29C5F6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0E0E0E', fontWeight: 800
                        }}>
                          {affiliator.profilePic ? (
                            <img src={affiliator.profilePic} alt={affiliator.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            (affiliator.name || 'A')[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{affiliator.name || 'Unnamed'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{affiliator.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#29C5F6' }}>@{affiliator.handle}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ 
                        background: 'rgba(41, 197, 246, 0.1)', color: '#29C5F6', padding: '4px 12px', 
                        borderRadius: '20px', display: 'inline-block', fontWeight: 700 
                      }}>
                        {affiliator.referralsCount}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedAffiliator(affiliator)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
                          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        View Network
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REFERRALS MODAL */}
      {selectedAffiliator && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#0E0E0E', border: '1px solid #1F2937', borderRadius: '16px',
            padding: '24px', width: '100%', maxWidth: '480px', position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedAffiliator(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px', background: 'transparent',
                border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem'
              }}
            >
              ✕
            </button>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>
              Network for @{selectedAffiliator.handle}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
              These creators successfully joined using their referral link.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
              {selectedAffiliator.referrals.map((ref) => (
                <div key={ref._id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                  background: '#16161E', borderRadius: '12px', border: '1px solid #1F2937'
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', background: '#38BDF8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0E0E0E',
                    fontWeight: 800, fontSize: '1.2rem', overflow: 'hidden'
                  }}>
                    {ref.profilePic ? (
                      <img src={ref.profilePic} alt={ref.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (ref.name || 'C')[0].toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ref.name || 'Unnamed Creator'}
                    </div>
                    <div style={{ color: '#38BDF8', fontSize: '0.85rem' }}>
                      @{ref.handle}
                    </div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'right' }}>
                    Joined<br/>{new Date(ref.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const navButtonStyle = (isActive) => ({
  background: 'transparent',
  border: 'none',
  color: isActive ? '#29C5F6' : '#94a3b8',
  fontSize: '1rem',
  fontWeight: isActive ? 700 : 500,
  cursor: 'pointer',
  padding: '8px',
  borderBottom: isActive ? '2px solid #29C5F6' : '2px solid transparent'
});

export default AdminAffiliators;

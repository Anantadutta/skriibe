import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const CreatorHealth = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Healthy'); // Healthy, At Risk, Critical

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/creators', { withCredentials: true });
        setCreators(res.data);
      } catch (err) {
        console.error('Failed to fetch creators', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  const healthy = creators.filter(c => c.calculatedStats?.healthStatus === 'Healthy');
  const atRisk = creators.filter(c => c.calculatedStats?.healthStatus === 'At Risk');
  const critical = creators.filter(c => c.calculatedStats?.healthStatus === 'Critical');

  let currentList = [];
  if (activeTab === 'Healthy') currentList = healthy;
  else if (activeTab === 'At Risk') currentList = atRisk;
  else if (activeTab === 'Critical') currentList = critical;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Creator Health</span>
        </div>
        <NotificationBell />
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Creator Health
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Monitor creator performance and SLA breaches</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#13131A', borderRadius: '12px', padding: '4px', width: '100%', border: '1px solid #1E1E2D', gap: '8px' }}>
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
          onClick={() => setActiveTab('At Risk')}
          style={{ 
            flex: 1, textAlign: 'center', padding: '12px 16px', borderRadius: '8px', 
            background: activeTab === 'At Risk' ? '#2A2A35' : 'transparent', 
            color: activeTab === 'At Risk' ? '#fff' : '#64748b', 
            fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
          }}>
          At Risk ({atRisk.length})
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

      <div style={{ color: activeTab === 'Healthy' ? '#10B981' : activeTab === 'At Risk' ? '#F59E0B' : '#EF4444', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '1px', marginTop: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <div key={creator._id} style={{ background: '#1C1510', border: '1px solid #332616', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1A4D3E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '900', border: '2px solid #236B56' }}>
                      {(creator.handle || creator.name || 'C')[0].toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>@{creator.handle || 'unknown'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'transparent', border: '1px solid #78350F', color: '#F59E0B', padding: '6px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      Warn
                    </button>
                    <button style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '6px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      Suspend
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#15100C', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div className="font-wide" style={{ color: replyColor, fontSize: '1.4rem', fontWeight: '900' }}>{stats.replyRate}%</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Reply</div>
                  </div>
                  <div style={{ background: '#15100C', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div className="font-wide" style={{ color: refundColor, fontSize: '1.4rem', fontWeight: '900' }}>{stats.refundRate}%</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Refunds</div>
                  </div>
                  <div style={{ background: '#15100C', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div className="font-wide" style={{ color: breachColor, fontSize: '1.4rem', fontWeight: '900', textAlign: 'center', lineHeight: '1.1' }}>
                      {stats.slaBreaches} this<br/>week
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '4px' }}>Breaches</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default CreatorHealth;

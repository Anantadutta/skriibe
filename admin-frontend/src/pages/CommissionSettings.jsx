import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommissionSettings = () => {
  const [creators, setCreators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Keep track of pending changes per creator
  const [overrides, setOverrides] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', isError: false });

  const openModal = (title, message, isError = false) => {
    setModalConfig({ isOpen: true, title, message, isError });
  };
  const closeModal = () => {
    setModalConfig({ isOpen: false, title: '', message: '', isError: false });
  };

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/creators`, { withCredentials: true });
        setCreators(res.data);
        
        // Initialize overrides state from existing data
        const initialOverrides = {};
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        res.data.forEach(c => {
          if (c.commissionOverride && c.commissionOverride.startDate) {
            const endDate = c.commissionOverride.endDate ? new Date(c.commissionOverride.endDate) : null;
            let isExpired = false;
            if (endDate) {
              const endObj = new Date(endDate);
              endObj.setHours(23, 59, 59, 999); // End of the day
              if (now > endObj) {
                isExpired = true;
              }
            }

            initialOverrides[c._id] = {
              creatorShare: isExpired ? 80 : (c.commissionOverride.creatorShare || 80),
              skriibeShare: isExpired ? 20 : (100 - (c.commissionOverride.creatorShare || 80)),
              startDate: new Date(c.commissionOverride.startDate).toISOString().split('T')[0],
              endDate: endDate ? endDate.toISOString().split('T')[0] : ''
            };
          } else {
            initialOverrides[c._id] = {
              creatorShare: 80,
              skriibeShare: 20,
              startDate: '',
              endDate: ''
            };
          }
        });
        setOverrides(initialOverrides);
      } catch (err) {
        console.error('Failed to fetch creators:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  const handleOverrideChange = (creatorId, field, value) => {
    setOverrides(prev => {
      const current = { ...prev[creatorId] };
      current[field] = value;
      
      // Auto-calculate the inverse percentage
      if (field === 'creatorShare') {
        const num = Math.min(100, Math.max(0, parseInt(value) || 0));
        current.creatorShare = num;
        current.skriibeShare = 100 - num;
      } else if (field === 'skriibeShare') {
        const num = Math.min(100, Math.max(0, parseInt(value) || 0));
        current.skriibeShare = num;
        current.creatorShare = 100 - num;
      }
      
      return { ...prev, [creatorId]: current };
    });
  };

  const handleSaveOverride = async (creatorId) => {
    const ov = overrides[creatorId];
    if (!ov.startDate || !ov.endDate) {
      openModal("Missing Dates", "Please select both a start date and an end date before saving.", true);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedStart = new Date(ov.startDate);
    const selectedEnd = new Date(ov.endDate);

    if (selectedStart < today || selectedEnd < today) {
      openModal(
        "Invalid Date Selection", 
        "The dates you have selected have already passed. Please select dates starting from today or in the future for the commission override to be valid.", 
        true
      );
      return;
    }

    setSavingId(creatorId);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/creators/${creatorId}/commission`, {
        creatorShare: ov.creatorShare,
        startDate: ov.startDate,
        endDate: ov.endDate
      }, { withCredentials: true });
      setSavedId(creatorId);
      setTimeout(() => setSavedId(null), 3000);
      openModal("Success", "Commission override saved successfully.");
    } catch (err) {
      console.error('Failed to save override:', err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to save override.";
      openModal("Error", "Failed to save override: " + errorMsg, true);
    } finally {
      setSavingId(null);
    }
  };

  const filteredCreators = creators.filter(c => {
    const query = searchQuery.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(query);
    const handleMatch = c.handle?.toLowerCase().includes(query);
    return nameMatch || handleMatch;
  });

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div>
        <h1 className="font-wide" style={{ margin: '0 0 8px 0', fontSize: '2rem', letterSpacing: '-0.03em' }}>Commission Settings</h1>
        <p style={{ margin: 0, color: '#94a3b8', lineHeight: '1.5' }}>
          Configure time-bound commission overrides per creator. <br/>
          <span style={{ color: '#10B981', fontWeight: '500' }}>Note: The default platform rate is currently 80% Creator / 20% Skriibe. Once a creator's selected override time period expires, their rate will automatically shift back to 80% Creator / 20% Skriibe.</span>
        </p>
      </div>

      {/* Creator Specific Commission Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Creator Overrides</h2>
          
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '300px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#13131A',
                border: '1px solid #1E1E2D',
                color: '#fff',
                padding: '10px 12px 10px 40px',
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Creators List */}
        <div style={{ background: '#13131A', borderRadius: '16px', border: '1px solid #1E1E2D', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Loading creators...</div>
          ) : filteredCreators.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No creators found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredCreators.map((creator, index) => {
                const ov = overrides[creator._id] || {};
                
                return (
                  <div 
                    key={creator._id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '24px',
                      borderBottom: index < filteredCreators.length - 1 ? '1px solid #1E1E2D' : 'none',
                      gap: '24px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
                      <div style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(45deg, #7c3aed, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', overflow: 'hidden', flexShrink: 0
                      }}>
                        {creator.avatarUrl ? (
                          <img src={creator.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (creator.name || creator.handle || '?').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>{creator.name || 'Unknown'}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>@{creator.handle}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      
                      {/* Percentages */}
                      <div style={{ display: 'flex', gap: '16px', background: '#0a0a0f', padding: '12px', borderRadius: '12px', border: '1px solid #2A2A35' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>Creator %</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input 
                              type="number" 
                              value={ov.creatorShare !== undefined ? ov.creatorShare : ''}
                              onChange={(e) => handleOverrideChange(creator._id, 'creatorShare', e.target.value)}
                              min="0" max="100"
                              style={{ width: '60px', background: 'transparent', border: 'none', borderBottom: '1px solid #38BDF8', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center', outline: 'none' }}
                            />
                            <span style={{ color: '#fff' }}>%</span>
                          </div>
                        </div>
                        <div style={{ width: '1px', background: '#2A2A35' }}></div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>Skriibe %</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input 
                              type="number" 
                              value={ov.skriibeShare !== undefined ? ov.skriibeShare : ''}
                              onChange={(e) => handleOverrideChange(creator._id, 'skriibeShare', e.target.value)}
                              min="0" max="100"
                              style={{ width: '60px', background: 'transparent', border: 'none', borderBottom: '1px solid #10B981', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center', outline: 'none' }}
                            />
                            <span style={{ color: '#fff' }}>%</span>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>From Date</div>
                          <input 
                            type="date" 
                            value={ov.startDate || ''}
                            onChange={(e) => handleOverrideChange(creator._id, 'startDate', e.target.value)}
                            style={{ background: '#0a0a0f', border: '1px solid #2A2A35', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', colorScheme: 'dark' }}
                          />
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>To Date</div>
                          <input 
                            type="date" 
                            value={ov.endDate || ''}
                            onChange={(e) => handleOverrideChange(creator._id, 'endDate', e.target.value)}
                            style={{ background: '#0a0a0f', border: '1px solid #2A2A35', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', colorScheme: 'dark' }}
                          />
                        </div>
                      </div>

                      {/* Save Button */}
                      <button 
                        onClick={() => handleSaveOverride(creator._id)}
                        disabled={savingId === creator._id}
                        style={{
                          background: savedId === creator._id ? '#10B981' : '#38BDF8',
                          color: savedId === creator._id ? '#fff' : '#000',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: savingId === creator._id ? 'not-allowed' : 'pointer',
                          opacity: savingId === creator._id ? 0.7 : 1,
                          alignSelf: 'flex-end',
                          marginBottom: '2px',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        {savingId === creator._id ? 'Saving...' : savedId === creator._id ? 'Saved ✓' : 'Save'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Modal UI */}
      {modalConfig.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#13131A', border: `1px solid ${modalConfig.isError ? '#EF4444' : '#10B981'}`, borderRadius: '24px', padding: '40px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px', lineHeight: 1 }}>
              {modalConfig.isError ? '⚠️' : '✅'}
            </div>
            <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
              {modalConfig.title}
            </h3>
            <p style={{ margin: '0 0 32px 0', color: '#94a3b8', lineHeight: '1.6', fontSize: '1.05rem' }}>
              {modalConfig.message}
            </p>
            <button 
              onClick={closeModal}
              style={{ 
                background: modalConfig.isError ? '#EF4444' : '#10B981', 
                color: '#fff', 
                border: 'none', 
                padding: '16px 32px', 
                borderRadius: '12px', 
                fontWeight: 'bold', 
                fontSize: '1.1rem', 
                cursor: 'pointer', 
                width: '100%',
                transition: 'transform 0.1s ease-in-out'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommissionSettings;

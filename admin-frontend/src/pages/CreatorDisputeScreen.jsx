import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const CreatorDisputeScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [banType, setBanType] = useState('');

  useEffect(() => {
    const fetchDispute = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/creator-disputes`, { withCredentials: true });
        const found = res.data.find(d => d._id === id);
        if (found) {
          setDispute(found);
          if (found.adminNotes) setAdminNotes(found.adminNotes);
        } else {
          setDispute(null);
        }
      } catch (err) {
        console.error('Error fetching creator dispute:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDispute();
  }, [id]);

  const handleResolve = async (decision) => {
    try {
      setSaving(true);
      const payload = { decision, notes: adminNotes };
      if (decision === 'abusive') {
        payload.banType = banType;
      }
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/creator-disputes/${id}/resolve`, payload, { withCredentials: true });
      navigate(-1);
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
      alert('Failed to save decision.');
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading dispute details...</div>;
  if (!dispute) return <div style={{ color: '#ef4444', padding: '40px', textAlign: 'center' }}>Dispute not found</div>;

  const isAbuse = dispute.rejectReason === 'abuse';

  return (
    <div style={{ padding: '32px 24px', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'center', marginBottom: '8px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            position: 'absolute', 
            left: 0, 
            background: '#21212B', 
            border: 'none', 
            color: '#94a3b8', 
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem', 
            cursor: 'pointer',
            paddingBottom: '2px'
          }}
        >
          ‹
        </button>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-0.02em', fontWeight: 'bold', color: '#fff' }}>
          Dispute #{dispute.disputeId || id.slice(-6)}
        </h1>
      </div>

      {/* Creator Reason */}
      <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
          CREATOR {isAbuse ? 'FLAGGED ABUSE' : 'REJECTED'}
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.4', fontStyle: 'italic' }}>
          "{isAbuse ? 'The creator flagged this question as abusive or inappropriate.' : `Rejected: ${dispute.rejectReason || 'Outside expertise'}`}"
        </p>
      </div>

      {/* The Question */}
      <div style={{ background: '#1A1A24', border: '1px solid #2A2A35', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
          QUESTION
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.4', fontStyle: 'italic' }}>
          "{dispute.questionText}"
        </p>
      </div>

      {/* Timestamps */}
      <div style={{ display: 'flex', gap: '16px', background: 'transparent', padding: '0 8px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>ASKED</span>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{new Date(dispute.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>FLAGGED/REJECTED</span>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{new Date(dispute.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
      </div>

      {/* Info Table */}
      <div className="bg-card-dark" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#13131A', borderRadius: '12px', border: '1px solid #1E1E2D' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Creator</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>{dispute.creatorId?.name ? `@${dispute.creatorId.handle || dispute.creatorId.name.toLowerCase()}` : '@creator'}</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Buyer</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>{dispute.buyerName || dispute.followerName || 'Anonymous'}</span>
            {(dispute.buyerEmail || dispute.buyerPhone) && (
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{dispute.buyerEmail || dispute.buyerPhone}</span>
            )}
            <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>First dispute by buyer</span>
          </div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Amount</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>₹{dispute.creatorId?.price || 99}</span>
        </div>
      </div>

      {/* Admin Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>
          Admin Notes (Internal only):
        </div>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Brief reason for your decision to create accountability..."
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '0.95rem',
            minHeight: '80px',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Admin Decision */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>
          Admin decision:
        </div>

        <button 
          onClick={() => setSelectedDecision('fan_wins')}
          disabled={saving}
          style={{ 
            background: selectedDecision === 'fan_wins' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.05)', 
            color: '#EF4444', 
            border: `1px solid ${selectedDecision === 'fan_wins' ? '#EF4444' : 'rgba(239, 68, 68, 0.3)'}`, 
            padding: '16px', 
            borderRadius: '12px', 
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Valid question - payout to the buyer/fan</span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(239, 68, 68, 0.7)' }}>Fan receives full refund back to original payment method.</span>
        </button>

        <button 
          onClick={() => setSelectedDecision('abusive')}
          disabled={saving}
          style={{ 
            background: selectedDecision === 'abusive' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.05)', 
            color: '#F59E0B', 
            border: `1px solid ${selectedDecision === 'abusive' ? '#F59E0B' : 'rgba(245, 158, 11, 0.3)'}`, 
            padding: '16px', 
            borderRadius: '12px', 
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Abusive question - payout to the creator</span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(245, 158, 11, 0.7)' }}>Creator keeps the payment, question stays closed. Fan will be banned.</span>
        </button>

        {selectedDecision === 'abusive' && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff', fontSize: '0.9rem' }}>
                <input 
                  type="radio" 
                  name="banType" 
                  value="7_days" 
                  checked={banType === '7_days'} 
                  onChange={(e) => setBanType(e.target.value)} 
                  style={{ accentColor: '#F59E0B' }}
                />
                Ban fan for 7 days
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff', fontSize: '0.9rem' }}>
                <input 
                  type="radio" 
                  name="banType" 
                  value="permanent" 
                  checked={banType === 'permanent'} 
                  onChange={(e) => setBanType(e.target.value)} 
                  style={{ accentColor: '#EF4444' }}
                />
                Ban fan permanently
              </label>
            </div>
          </div>
        )}

        {selectedDecision && (
          <button 
            onClick={() => handleResolve(selectedDecision)}
            disabled={saving || (selectedDecision === 'abusive' && !banType)}
            style={{
              background: (selectedDecision === 'abusive' && !banType) ? '#333' : '#F59E0B',
              color: (selectedDecision === 'abusive' && !banType) ? '#888' : '#fff',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: ((selectedDecision === 'abusive' && !banType) || saving) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginTop: '8px'
            }}
          >
            {saving ? 'Submitting...' : 'Submit Decision'}
          </button>
        )}
      </div>

    </div>
  );
};

export default CreatorDisputeScreen;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const DisputeScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [decision, setDecision] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [successModal, setSuccessModal] = useState({ show: false, message: '', redirect: '' });

  useEffect(() => {
    const fetchDispute = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/buyer-disputes`, { withCredentials: true });
        const found = res.data.find(d => d._id === id);
        setDispute(found || null);
        if (found && found.adminNotes) setAdminNotes(found.adminNotes);
        if (found && found.adminDecision) setDecision(found.adminDecision);
      } catch (err) {
        console.error('Error fetching dispute:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDispute();
  }, [id]);

  if (loading) return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading dispute details...</div>;
  if (!dispute) return <div style={{ color: '#ef4444', padding: '40px', textAlign: 'center' }}>Dispute not found</div>;

  const executeResolve = async () => {
    if (!decision) return alert('Please select a decision');
    setIsResolving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/buyer-disputes/${id}/resolve`, {
        decision,
        notes: adminNotes
      }, { withCredentials: true });
      setSuccessModal({ show: true, message: 'Dispute resolved successfully', redirect: '/admin/buyer-disputes' });
    } catch (err) {
      console.error('Error resolving dispute:', err);
      alert('Failed to resolve dispute');
    } finally {
      setIsResolving(false);
    }
  };

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
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-0.02em', fontWeight: 'bold' }}>
          Dispute #{dispute.disputeId || id.slice(-6)}
        </h1>
      </div>

      {/* Buyer Flagged Reply */}
      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
          BUYER FLAGGED REPLY
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.4', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          "{dispute.flagReason || 'No specific reason provided.'}"
        </p>
      </div>

      {/* The Question */}
      <div style={{ background: '#1A1A24', border: '1px solid #2A2A35', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
          QUESTION
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.4', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          "{dispute.questionText}"
        </p>
      </div>

      {/* Creator's Reply */}
      <div className="bg-card-dark" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
          CREATOR'S REPLY
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffffff', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          "{dispute.answerText || 'No answer provided.'}"
        </div>
        {dispute.answerText && dispute.answerText.length < 100 && (
          <div style={{ color: '#EF4444', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {dispute.answerText.length} characters — below 100 minimum
          </div>
        )}
      </div>

      {/* Info Table */}
      <div className="bg-card-dark" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Buyer/Fan</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{dispute.buyerName || 'Anonymous Buyer'}</span>
            {dispute.buyerEmail && (
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>{dispute.buyerEmail}</span>
            )}
          </div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Creator</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{dispute.creatorId?.name ? `@${dispute.creatorId.handle || dispute.creatorId.name.toLowerCase()}` : '@creator'}</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Amount</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>₹{dispute.amountPaid || dispute.pricePaid || dispute.creatorId?.price || 99}</span>
        </div>
      </div>

      {/* Admin Decision Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', background: '#13131A', padding: '20px', borderRadius: '12px', border: '1px solid #1E1E2D' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px' }}>
          Admin Notes & Decision
        </div>
        
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Enter notes about this decision..."
          style={{
            background: '#1A1A24',
            border: '1px solid #2A2A35',
            borderRadius: '8px',
            padding: '12px',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            minHeight: '100px',
            resize: 'vertical',
            outline: 'none'
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#e2e8f0', fontSize: '0.95rem' }}>
            <input 
              type="radio" 
              name="decision" 
              value="creator_wins" 
              checked={decision === 'creator_wins'}
              onChange={(e) => setDecision(e.target.value)}
              style={{ accentColor: '#38BDF8', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Dismiss — payout to creator
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#e2e8f0', fontSize: '0.95rem' }}>
            <input 
              type="radio" 
              name="decision" 
              value="fan_wins" 
              checked={decision === 'fan_wins'}
              onChange={(e) => setDecision(e.target.value)}
              style={{ accentColor: '#38BDF8', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Issue full refund to buyer
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#e2e8f0', fontSize: '0.95rem' }}>
            <input 
              type="radio" 
              name="decision" 
              value="partial_refund" 
              checked={decision === 'partial_refund'}
              onChange={(e) => setDecision(e.target.value)}
              style={{ accentColor: '#38BDF8', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Partial refund to the buyer/ creator
          </label>
        </div>

        <button 
          onClick={executeResolve}
          disabled={isResolving || !decision}
          style={{ 
            background: decision ? '#38BDF8' : '#2A2A35', 
            color: decision ? '#000' : '#64748b', 
            border: 'none', 
            padding: '16px', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            cursor: decision && !isResolving ? 'pointer' : 'not-allowed',
            marginTop: '12px',
            transition: 'all 0.2s'
          }}
        >
          {isResolving ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {successModal.show && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px'
        }}>
          <div style={{
            background: '#13131A',
            border: '1px solid #2A2A35',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
              {successModal.message}
            </h3>
            <button
              onClick={() => {
                setSuccessModal({ ...successModal, show: false });
                if (successModal.redirect) {
                  navigate(successModal.redirect);
                }
              }}
              style={{
                width: '100%',
                background: '#38BDF8',
                color: '#000',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DisputeScreen;

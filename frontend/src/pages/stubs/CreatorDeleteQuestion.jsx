import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../../services/api';

const CreatorDeleteQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const question = location.state?.question;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/creator/questions/${id}`);
      if (res.data.success) {
        navigate('/creator/inbox');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      alert(`Failed to delete question: ${err.response?.data?.message || err.message}`);
      setIsDeleting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0E0E0E',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '390px',
        background: '#16161e',
        border: '1px solid #2A2A2A',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          fontSize: '24px'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </div>

        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Delete Question?</h2>
        
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Are you sure you want to delete this question? This action cannot be undone and it will be permanently removed from your inbox.
        </p>

        {question && (
          <div style={{
            background: '#1A1A1A',
            padding: '12px',
            borderRadius: '8px',
            color: '#e2e8f0',
            fontSize: '0.9rem',
            textAlign: 'left',
            fontStyle: 'italic',
            borderLeft: '3px solid #2A2A2A'
          }}>
            "{question.questionText?.length > 60 ? question.questionText.substring(0, 60) + '...' : question.questionText}"
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: '#EF4444',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
          
          <button 
            onClick={() => navigate('/creator/inbox')}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #2A2A2A',
              background: 'transparent',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorDeleteQuestion;

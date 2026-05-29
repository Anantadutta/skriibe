import React from 'react';
import { useParams, Link } from 'react-router-dom';

const FlagSubmittedPage = () => {
  const { handle } = useParams();

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#06060A',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '600px', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <span style={{ color: '#22c55e', fontSize: '40px' }}>✓</span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Flag submitted
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px' }}>
          Your dispute has been opened. The creator's payout is paused while our admin team reviews your case. You will be notified of the resolution within 48 hours.
        </p>

        <Link 
          to={`/${handle}/demo-answer`}
          style={{
            width: '100%',
            background: '#29C5F6',
            color: '#0E0E0E',
            textDecoration: 'none',
            padding: '18px',
            borderRadius: '16px',
            fontSize: '1.1rem',
            fontWeight: '800',
            display: 'block'
          }}
        >
          Back to answer
        </Link>
        
        <Link 
          to={`/${handle}`}
          style={{
            width: '100%',
            background: 'transparent',
            color: '#64748b',
            textDecoration: 'none',
            padding: '18px',
            borderRadius: '16px',
            fontSize: '1rem',
            fontWeight: '700',
            display: 'block',
            marginTop: '8px'
          }}
        >
          Go to Creator Profile
        </Link>

      </div>
    </div>
  );
};

export default FlagSubmittedPage;

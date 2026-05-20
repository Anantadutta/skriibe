/**
 * @file CreatorInbox.jsx
 * @description Inbox placeholder page.
 */

import React from 'react';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { BottomNav } from '../../components/ama/layout/BottomNav';

const CreatorInbox = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0B10',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--g3)',
        letterSpacing: '0.1em',
        marginBottom: '20px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
        C7 — INBOX
      </div>

      <PhoneFrame>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          <span style={{ fontSize: '40px', marginBottom: '16px' }}>💬</span>
          <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px' }}>
            Questions Inbox
          </h2>
          <p style={{ color: 'var(--g3)', fontSize: '12px', margin: 0 }}>
            Your inbox is coming soon
          </p>

          <BottomNav activeTab="inbox" />
        </div>
      </PhoneFrame>
    </div>
  );
};

export default CreatorInbox;

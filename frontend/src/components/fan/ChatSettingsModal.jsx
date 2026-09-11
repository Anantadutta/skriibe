import React from 'react';
import { CHAT_THEMES } from '../../utils/themes';

const ChatSettingsModal = ({ currentThemeId, onSelectTheme, onClose }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '400px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111' }}>Chat Theme</h2>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
          >
            ✕
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px',
          maxHeight: '60vh',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {Object.values(CHAT_THEMES).map((theme) => {
            const isActive = currentThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: isActive ? '#f0f9ff' : '#f8fafc',
                  border: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                  borderRadius: '16px',
                  padding: '16px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(56, 189, 248, 0.2)' : 'none'
                }}
              >
                <div style={{ 
                  fontSize: '32px', 
                  marginBottom: '8px',
                  filter: isActive ? 'none' : 'grayscale(30%)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s'
                }}>
                  {theme.emoji}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: isActive ? 'bold' : '600',
                  color: isActive ? '#0369a1' : '#475569',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {theme.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal;

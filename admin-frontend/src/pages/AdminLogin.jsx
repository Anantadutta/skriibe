import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'secretadmin' && password === 'secret@123admin') {
      onLogin();
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0E0E0E' }}>
      <div className="bg-card" style={{ padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
          Admin Portal
        </h1>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          Enter your admin username and password to continue.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #2A2A2A', 
              background: '#13131f', 
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #2A2A2A', 
              background: '#13131f', 
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          {error && <div style={{ color: '#EF4444', fontSize: '0.8rem', textAlign: 'left' }}>{error}</div>}
          <button 
            type="submit" 
            style={{ 
              background: '#38BDF8', 
              color: '#000', 
              border: 'none', 
              padding: '12px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '1rem',
              cursor: 'pointer' 
            }}
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { upgradeToCreator } from '../../services/fanApi';
import { useAuth } from '../../context/AuthContext';

const categories = [
  'Career & Finance', 'Health & Fitness', 'Tech & Skills', 
  'Fashion & Lifestyle', 'Daily Vlogs & Entertainment', 'Education', 
  'Business & Entrepreneurship', 'Relationships & Life', 'Spirituality', 'Others'
];

const FanToCreatorUpgrade = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    creator_name: '',
    bio: '',
    category: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (step === 1 && (!formData.creator_name || !formData.bio)) {
      setError('Please fill out all fields');
      return;
    }
    if (step === 2 && !formData.category) {
      setError('Please select a category');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await upgradeToCreator(formData.creator_name, formData.bio, formData.category);
      if (res.success) {
        setAuthData(['fan', 'creator'], 'creator', res.token);
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h1 style={headingStyle}>You're a creator now!</h1>
          <p style={subtextStyle}>Switch between Fan and Creator mode anytime from your profile.</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '30px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/creator/dashboard')} style={primaryBtnStyle}>
              Go to Creator Studio
            </button>
            <button onClick={() => navigate('/explore')} style={secondaryBtnStyle}>
              Stay in Fan mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '12px', color: '#06b6d4' }}>
          <span>Step {step} of 3</span>
          <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => navigate(-1)}>Cancel</span>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {step === 1 && (
          <div>
            <h2 style={headingStyle}>Identity</h2>
            <p style={subtextStyle}>Tell fans who you are.</p>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Creator Name</label>
              <input 
                name="creator_name" 
                value={formData.creator_name} 
                onChange={handleChange} 
                style={inputStyle} 
                placeholder="e.g. John Doe"
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Bio</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} 
                placeholder="I help people with..."
              />
            </div>
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button onClick={handleNext} style={primaryBtnStyle}>Next →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={headingStyle}>Category</h2>
            <p style={subtextStyle}>What is your main area of expertise?</p>
            <div style={{ ...inputGroupStyle, position: 'relative' }}>
              <div 
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: formData.category ? '#ffffff' : '#94a3b8'
                }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {formData.category || 'Select a category'}
                <span style={{ fontSize: '12px', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
              </div>
              
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '8px',
                  background: '#13161C',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  zIndex: 50,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}>
                  {categories.map(cat => (
                    <div 
                      key={cat}
                      onClick={() => {
                        setFormData({ ...formData, category: cat });
                        setError('');
                        setDropdownOpen(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        color: formData.category === cat ? '#06b6d4' : '#ffffff',
                        background: formData.category === cat ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (formData.category !== cat) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.category !== cat) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button onClick={handleBack} style={secondaryBtnStyle}>← Back</button>
              <button onClick={handleNext} style={primaryBtnStyle}>Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={headingStyle}>Confirmation</h2>
            <p style={subtextStyle}>Ready to become a creator?</p>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', textAlign: 'left', marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px' }}><strong style={{ color: '#06b6d4' }}>Name:</strong> {formData.creator_name}</div>
              <div style={{ marginBottom: '10px' }}><strong style={{ color: '#06b6d4' }}>Category:</strong> {formData.category}</div>
              <div><strong style={{ color: '#06b6d4' }}>Bio:</strong> {formData.bio}</div>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
              Once you upgrade, you can switch between Fan and Creator mode anytime. Your fan data stays exactly as it is.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handleBack} disabled={loading} style={secondaryBtnStyle}>← Back</button>
              <button onClick={handleSubmit} disabled={loading} style={primaryBtnStyle}>
                {loading ? 'Upgrading...' : 'Submit & Become a Creator'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  minHeight: '100vh',
  background: '#0a0a0f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  color: '#ffffff',
  fontFamily: 'var(--font-body)'
};

const cardStyle = {
  maxWidth: '480px',
  width: '100%',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  padding: '30px',
  textAlign: 'center'
};

const headingStyle = {
  fontSize: '24px',
  fontWeight: '700',
  marginBottom: '10px',
  color: '#fff'
};

const subtextStyle = {
  color: '#94a3b8',
  fontSize: '14px',
  marginBottom: '24px'
};

const inputGroupStyle = {
  textAlign: 'left',
  marginBottom: '16px'
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: '#06b6d4',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '6px',
  fontWeight: '600'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box'
};

const primaryBtnStyle = {
  padding: '12px 24px',
  background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
  color: '#ffffff',
  fontWeight: '600',
  border: 'none',
  borderRadius: '999px',
  cursor: 'pointer'
};

const secondaryBtnStyle = {
  padding: '12px 24px',
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#ffffff',
  fontWeight: '600',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '999px',
  cursor: 'pointer'
};

const errorStyle = {
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '20px',
  fontSize: '13px'
};

export default FanToCreatorUpgrade;

/**
 * @file CreatorOnboardProfile.jsx
 * @description Step 1 of onboarding: Profile setup.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkHandle, saveProfile } from '../../services/creatorApi';
import { Button } from '../../components/ama/ui/Button';
import { Field } from '../../components/ama/ui/Field';
import { Avatar } from '../../components/ama/ui/Avatar';
import { CharCounter } from '../../components/ama/ui/CharCounter';
import { useCreatorOnboarding } from '../../context/CreatorOnboardingContext';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const CreatorOnboardProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creatorData = location.state?.creator;

  const { igData } = useCreatorOnboarding();

  const [form, setForm] = useState({
    name: creatorData?.name || igData?.name || '',
    handle: creatorData?.handle || igData?.handle || '',
    bio: creatorData?.bio || igData?.bio || '',
    expertise: creatorData?.expertise || [],
    instagramHandle: creatorData?.instagramHandle || igData?.handle || ''
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(creatorData?.avatarUrl || igData?.avatarUrl || null);
  const [handleStatus, setHandleStatus] = useState({ checking: false, available: null, error: '' });
  const [loading, setLoading] = useState(false);
  const [customExpertise, setCustomExpertise] = useState('');

  const expertiseOptions = ['Finance', 'Fitness', 'UPSC', 'Career', 'Business', 'Nutrition', 'Tech'];

  useEffect(() => {
    if (!creatorData) {
      navigate('/creator/signup');
    }
  }, [creatorData, navigate]);

  const validateHandle = useCallback(
    debounce(async (handle) => {
      if (handle.length < 3) {
        setHandleStatus({ checking: false, available: null, error: '' });
        return;
      }
      setHandleStatus({ checking: true, available: null, error: '' });
      try {
        const res = await checkHandle(handle);
        setHandleStatus({ checking: false, available: res.data.available, error: '' });
      } catch (err) {
        setHandleStatus({ checking: false, available: null, error: 'Check failed' });
      }
    }, 500),
    []
  );

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'handle') {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setForm(prev => ({ ...prev, handle: sanitized }));
      validateHandle(sanitized);
    }
  };

  const toggleExpertise = (item) => {
    setForm(prev => {
      const exists = prev.expertise.includes(item);
      if (exists) {
        return { ...prev, expertise: prev.expertise.filter(e => e !== item) };
      } else {
        return { ...prev, expertise: [...prev.expertise, item] };
      }
    });
  };

  const addCustomExpertise = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = customExpertise.trim();
      if (val && !form.expertise.includes(val)) {
        setForm(prev => ({ ...prev, expertise: [...prev.expertise, val] }));
      }
      setCustomExpertise('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large (max 5MB)');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.mimetype || file.type)) {
        alert('Only JPG/PNG allowed');
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleContinue = async () => {
    if (!form.name || !form.handle || handleStatus.available === false || form.expertise.length === 0) return;

    setLoading(true);
    try {
      await saveProfile(form);
      navigate('/creator/onboarding/pricing', { state: { creator: { ...creatorData, ...form } } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const canContinue = form.name.length >= 2 &&
    form.handle.length >= 3 &&
    handleStatus.available === true &&
    form.expertise.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ink)',
      display: 'flex',
      justifyContent: 'center',
      padding: '40px 20px',
      paddingBottom: '100px' // for sticky footer
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--ink2)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--ink5)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* HEADER */}
        <div style={{ textAlign: 'center', padding: '0 0 24px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: 'var(--white)', margin: '0 0 8px' }}>
            Set up your profile
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ink5)' }} />
            <span style={{ color: 'var(--g3)', fontSize: '10px', fontFamily: 'var(--font-mono)', marginLeft: '4px' }}>STEP 1 OF 2</span>
          </div>
        </div>

        {/* AVATAR UPLOAD */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 12px',
            borderRadius: '50%',
            border: avatarPreview ? 'none' : '2px dashed var(--ink5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Avatar name={form.name || 'S'} size={80} />
            )}
          </div>
          <label style={{ color: 'var(--blue)', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
            Upload photo
            <input type="file" hidden accept="image/jpeg,image/png" onChange={handleFileChange} />
          </label>
        </div>

        {/* FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Field
            label="FULL NAME"
            value={form.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Your name"
          />

          <div>
            <Field
              label="CHOOSE HANDLE"
              value={form.handle}
              onChange={(e) => handleInputChange('handle', e.target.value)}
              placeholder="e.g. yourname"
            />
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {handleStatus.checking && <span style={{ color: 'var(--g3)', fontSize: '11px' }}>Checking...</span>}
              {handleStatus.available === true && <span style={{ color: 'var(--green)', fontSize: '11px' }}>✓ Available</span>}
              {handleStatus.available === false && <span style={{ color: 'var(--red)', fontSize: '11px' }}>✗ Already taken</span>}
            </div>
          </div>

          <Field
            label="INSTAGRAM HANDLE"
            value={form.instagramHandle}
            onChange={(e) => handleInputChange('instagramHandle', e.target.value.replace('@', ''))}
            placeholder="username"
          />

          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--g3)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
              YOUR EXPERTISE
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {expertiseOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleExpertise(opt)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: form.expertise.includes(opt) ? 'var(--bdim)' : 'var(--ink3)',
                    color: form.expertise.includes(opt) ? 'var(--blue)' : 'var(--g2)',
                    border: `1px solid ${form.expertise.includes(opt) ? 'var(--blue)' : 'var(--ink5)'}`
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add your own..."
              value={customExpertise}
              onChange={(e) => setCustomExpertise(e.target.value)}
              onKeyDown={addCustomExpertise}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--ink5)',
                color: 'var(--white)',
                padding: '8px 0',
                marginTop: '12px',
                width: '100%',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--g3)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              BIO
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => handleInputChange('bio', e.target.value.slice(0, 200))}
              placeholder="Tell your followers what you know..."
              rows={3}
              style={{
                width: '100%',
                background: 'var(--ink3)',
                border: '1px solid var(--ink5)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                color: 'var(--white)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                resize: 'none',
                outline: 'none'
              }}
            />
            <div style={{ marginTop: '8px' }}>
              <CharCounter current={form.bio.length} limit={200} />
            </div>
          </div>

          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: '20px',
            background: 'var(--ink2)',
            borderTop: '1px solid var(--ink5)',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>
              <Button
                disabled={!canContinue || loading}
                onClick={handleContinue}
              >
                {loading ? 'Saving...' : 'Continue →'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorOnboardProfile;

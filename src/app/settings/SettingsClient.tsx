'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { User } from '@prisma/client';
import { useToast } from '@/components/ToastContext';
type UserWithTags = User & { tags?: string[] };

export default function SettingsClient({ user }: { user: UserWithTags }) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    image: user.image || '/assets/user.png',
    wallCommentsPrivacy:
      (user as User & { wallCommentsPrivacy?: string }).wallCommentsPrivacy || 'everyone',
  });
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '#e74c3c',
  });

  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    setPasswordStrength(evaluatePasswordStrength(password));
  }, [password]);

  function evaluatePasswordStrength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;
    if (score <= 1) return { score: 20, label: 'Too weak', color: '#e74c3c' };
    if (score === 2) return { score: 40, label: 'Weak', color: '#e67e22' };
    if (score === 3) return { score: 60, label: 'Medium', color: '#f1c40f' };
    if (score === 4) return { score: 80, label: 'Strong', color: '#27ae60' };
    return { score: 100, label: 'Very strong', color: '#2ecc71' };
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form }),
    });
    setLoading(false);
    if (res.ok) showToast({ type: 'success', message: 'Profile updated successfully!' });
    else showToast({ type: 'error', message: 'Profile update failed, try again later.' });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      showToast({ type: 'error', message: 'Passwords do not match!' });
      return;
    }
    if (passwordStrength.score < 40) {
      showToast({ type: 'error', message: 'Password is too weak' });
      return;
    }
    setLoading(true);
    const res = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) showToast({ type: 'success', message: 'Password changed successfully!' });
    else showToast({ type: 'error', message: 'Password change failed' });
    setPassword('');
    setPassword2('');
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (deleteInput !== user.username) {
      setDeleteError('Username does not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        signOut();
        window.location.href = '/login';
      } else {
        setDeleteError(data.error || 'Account deletion failed');
      }
    } catch {
      setLoading(false);
      setDeleteError('An error occurred. Please try again.');
    }
  };

  const resendVerificationEmail = async () => {
    setLoading(true);
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      showToast({
        type: 'success',
        message: 'Verification email sent! Please check your inbox.',
      });
    } else if (res.status === 400) {
      showToast({
        type: 'error',
        message:
          data.error || 'A verification email has already been sent. Please check your inbox.',
      });
    } else if (res.status === 404) {
      showToast({
        type: 'error',
        message: 'Email not registered. Please sign up first.',
      });
    } else {
      showToast({
        type: 'error',
        message: 'Failed to send verification email. Please try again later.',
      });
    }
  };

  return (
    <div className="settings-client">
      <div className="settings-section">
        <h2>Profile Info</h2>
        <form onSubmit={handleProfileSubmit} className="settings-form">
          <div className="settings-avatar">
            <Image
              src={form.image}
              alt="Profile"
              width={80}
              height={80}
              style={{ borderRadius: '50%' }}
            />
          </div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            disabled
          />
          <label htmlFor="email">Email</label>
          <div
            className="settings-email-info"
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled
            />
            <span className="settings-email-status">
              {user.isEmailVerified ? (
                <span
                  className="verified"
                  style={{ display: 'flex', alignItems: 'center', color: '#1c8a00' }}
                >
                  <Image
                    src="/assets/check.png"
                    alt="Check"
                    width={18}
                    height={18}
                    style={{
                      margin: '0 8px 0 4px',
                      filter:
                        'brightness(0) saturate(100%) invert(47%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)',
                    }}
                  />
                  Email Verified
                </span>
              ) : (
                <div>
                  <span
                    className="not-verified"
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Image
                      src="/assets/warning.png"
                      alt="Warning"
                      width={18}
                      height={18}
                      style={{
                        margin: '0 8px 0 4px',
                        filter:
                          'brightness(0) saturate(100%) invert(85%) sepia(95%) saturate(2500%) hue-rotate(5deg) brightness(105%) contrast(101%)',
                      }}
                    />
                    <p style={{ color: '#e6b822' }}>Email Not Verified</p>
                    <p style={{ padding: '0 8px 0 8px' }}>|</p>
                    <a
                      href="#"
                      onClick={resendVerificationEmail}
                      style={{ color: 'var(--main-color)', textDecoration: 'none' }}
                    >
                      Resend Verification
                    </a>
                  </span>
                </div>
              )}
            </span>
          </div>
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} maxLength={160} />
          <button type="submit" disabled={loading}>
            Save Profile
          </button>
        </form>
      </div>
      <div className="settings-section">
        <h2>Privacy Settings</h2>
        <form onSubmit={handleProfileSubmit} className="settings-form">
          <label htmlFor="wallCommentsPrivacy">Wall Comments</label>
          <select
            id="wallCommentsPrivacy"
            name="wallCommentsPrivacy"
            value={form.wallCommentsPrivacy}
            onChange={handleChange}
          >
            <option value="everyone">Everyone can comment</option>
            <option value="owner-only">Only I can comment</option>
          </select>
          <small style={{ color: '#888', marginTop: '-8px' }}>
            Control who can leave comments on your user wall
          </small>
          <button type="submit" disabled={loading}>
            Save Privacy Settings
          </button>
        </form>
      </div>
      <div className="settings-section">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="settings-form">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <div
            className="password-strength-bar"
            style={{ background: '#333', borderRadius: 4, height: 8, margin: '8px 0' }}
          >
            <div
              style={{
                width: `${passwordStrength.score}%`,
                background: passwordStrength.color,
                height: 8,
                borderRadius: 4,
                transition: 'width 0.2s',
              }}
            />
          </div>
          <small style={{ color: passwordStrength.color }}>{passwordStrength.label}</small>
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            id="password2"
            name="password2"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading}>
            Change Password
          </button>
        </form>
      </div>
      <div className="settings-section danger-zone">
        <h2 className="danger-title">Danger Zone</h2>
        <p className="danger-desc">
          Deleting your account is <b>irreversible</b>. All your data will be permanently removed.
          Please proceed with caution.
        </p>
        <button className="danger-btn" onClick={() => setShowDeleteModal(true)} type="button">
          Delete Account
        </button>
      </div>
      {showDeleteModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal danger-modal">
            <button
              className="modal-close-btn"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3>Confirm Account Deletion</h3>
            <p>
              Type your username <b>{user.username}</b> to confirm deletion. This action cannot be
              undone.
            </p>
            <input
              type="text"
              placeholder="Enter your username"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="danger-input"
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="danger-btn"
                onClick={handleDeleteAccount}
                disabled={deleteInput !== user.username || loading}
              >
                {loading ? 'Deleting...' : 'Delete Forever'}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
            {deleteError && <div className="danger-error">{deleteError}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

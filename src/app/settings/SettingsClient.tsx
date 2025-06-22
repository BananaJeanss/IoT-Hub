'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User } from '@prisma/client';
import { useToast } from '@/components/ToastContext';
type UserWithTags = User & { tags?: string[] };

// Components
import ProfilePage from './pages/profile';
import PrivacyPage from './pages/privacy';

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

  const [currentPage] = useState<'profile' | 'privacy'>('profile');

  return (
    <div id="settings-container">
      <div id="left-navbar">
        <h1>Settings</h1>
        <hr />
        <ul>
          <li>
            <button>
              <Image src="/assets/profile.png" alt="Profile Icon" width={24} height={24} />
              Profile
            </button>
          </li>
        </ul>
      </div>
      <div id="settings-content">
        {currentPage === 'profile' && (
          <ProfilePage
            user={{
              ...user,
              username: user.username ?? '',
              email: user.email ?? '',
              image: user.image ?? '',
              bio: user.bio ?? '',
              tags: user.tags ?? [],
              backgroundType: user.backgroundType ?? '',
              backgroundImage: user.backgroundImage ?? '',
              gradientStartRgb: user.gradientStartRgb ?? '',
              gradientEndRgb: user.gradientEndRgb ?? '',
            }}
            form={form}
            handleChange={handleChange}
            handleProfileSubmit={handleProfileSubmit}
            loading={loading}
            resendVerificationEmail={resendVerificationEmail}
          />
        )}
        {currentPage === 'privacy' && (
          <PrivacyPage
            user={{
              username: user.username ?? '',
              email: user.email ?? '',
              image: user.image ?? undefined,
              bio: user.bio ?? undefined,
              tags: user.tags ?? undefined,
            }}
            form={form}
            handleChange={handleChange}
            handlePasswordSubmit={handlePasswordSubmit}
            password={password}
            setPassword={setPassword}
            password2={password2}
            setPassword2={setPassword2}
            passwordStrength={passwordStrength}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

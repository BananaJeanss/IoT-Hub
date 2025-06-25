'use client';
import { useState, useRef } from 'react';
import { User } from '@prisma/client';
import { useToast } from '@/components/ToastContext';
import { signOut } from 'next-auth/react';

import { Shield, UserRound, TriangleAlert } from 'lucide-react';

// Components
import ProfilePage from './pages/profile';
import PrivacyPage from './pages/privacy';
import DangerZone from './pages/dangerZone';
import UnsavedChanges from './pages/unsavedChanges';

type UserForm = {
  username: string;
  email: string;
  bio: string;
  image: string;
  wallCommentsPrivacy: string;
};

type UserWithTags = User & { tags?: string[] };

export default function SettingsClient({ user }: { user: UserWithTags }) {
  const { showToast } = useToast();

  const [form, setForm] = useState<UserForm>({
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    image: user.image || '/assets/user.png',
    wallCommentsPrivacy:
      (user as User & { wallCommentsPrivacy?: string }).wallCommentsPrivacy || 'everyone',
  });
  // Keep a ref to the initial form to compare for unsaved changes
  const initialForm = useRef(form);

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    // Compare newForm to initialForm to determine unsaved changes
    const noChanges = Object.keys(newForm).every(
      (key) => newForm[key as keyof UserForm] === initialForm.current[key as keyof UserForm],
    );
    setHasUnsavedChanges(!noChanges);
  };

  // Add saveChanges function to persist settings
  const saveChanges = async () => {
    setLoading(true);
    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      showToast({ type: 'success', message: 'Settings saved successfully!' });
      setHasUnsavedChanges(false);
    } else {
      showToast({ type: 'error', message: 'Failed to save settings. Please try again.' });
    }
  };

  // Add discardChanges to reset form to initial values
  const discardChanges = () => {
    setForm({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      image: user.image || '/assets/user.png',
      wallCommentsPrivacy:
        (user as User & { wallCommentsPrivacy?: string }).wallCommentsPrivacy || 'everyone',
    });
    setHasUnsavedChanges(false);
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

  const deleteAccount = async () => {
    setLoading(true);
    const res = await fetch('/api/user/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username }),
    });
    setLoading(false);
    if (res.ok) {
      showToast({ type: 'success', message: 'Account deleted successfully!' });
      await signOut({ callbackUrl: '/' });
    } else {
      showToast({
        type: 'error',
        message: 'Failed to delete account. Try again later.',
      });
    }
  };

  const [currentPage, setCurrentPage] = useState<'profile' | 'privacy' | 'dangerZone'>('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  return (
    <div id="settings-container-container">
      <div id="settings-container">
        <div id="left-navbar">
          <h1>Settings</h1>
          <hr />
          <ul>
            <li>
              <button
                className={currentPage === 'profile' ? 'active' : ''}
                onClick={() => setCurrentPage('profile')}
              >
                <UserRound size={24} />
                Profile
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'privacy' ? 'active' : ''}
                onClick={() => setCurrentPage('privacy')}
              >
                <Shield size={24} />
                Privacy
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'dangerZone' ? 'active' : ''}
                onClick={() => setCurrentPage('dangerZone')}
              >
                <TriangleAlert size={24} />
                Danger Zone
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
              setLoading={setLoading}
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
              loading={loading}
            />
          )}
          {currentPage === 'dangerZone' && (
            <DangerZone username={user.username ?? ''} deleteAccount={deleteAccount} />
          )}
        </div>
      </div>
      <UnsavedChanges
        unsavedChanges={hasUnsavedChanges}
        saveChanges={saveChanges}
        discardChanges={discardChanges}
      />
    </div>
  );
}

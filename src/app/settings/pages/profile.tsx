'use client';

import Image from 'next/image';
import React from 'react';

import './profile.css';

interface ProfilePageProps {
  user: {
    username: string;
    email: string;
    image: string;
    bio: string;
    tags?: string[];
    isEmailVerified?: boolean;
    backgroundType?: string;
    backgroundImage?: string;
    gradientStartRgb?: string;
    gradientEndRgb?: string;
  };
  form: {
    bio: string;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handleProfileSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resendVerificationEmail: () => void;
}

export default function ProfilePage({
  user,
  form,
  handleChange,
  loading,
  resendVerificationEmail,
}: ProfilePageProps) {
  return (
    <div className="settings-page">
      <h2>Profile</h2>
      <hr id="settings-hr" />

      <div
        id="profile-banner-container"
        style={{
          backgroundImage:
            user.backgroundType === 'image'
              ? `url(${user.backgroundImage})`
              : user.backgroundType === 'gradient'
                ? `linear-gradient(135deg, ${user.gradientStartRgb}, ${user.gradientEndRgb})`
                : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div id="profile-banner-overlay">
          <div id="profile-banner-content">
            <div id="profile-image-container">
              <Image
                src={user.image || '/assets/user.png'}
                alt="Profile Image"
                width={100}
                height={100}
                className="profile-image"
              />
            </div>
            <div id="profile-info-container">
              <h3 className="profile-username">@{user.username}</h3>
              <p className="profile-bio">{user.bio}</p>
              <div className="profile-tags">
                {user.tags?.map((tag, index) => (
                  <span key={index} className="profile-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="profile-settings-containers">
        <div id="profile-settings-container" style={{ height: '25%' }}>
          <div className="profile-setting-field">
            <p>Username:</p>
            <input
              type="text"
              value={user.username}
              className="profile-input"
              title="Username"
              disabled
            />
            <hr />
          </div>
          <div className="profile-setting-field">
            <div className="profile-email-container">
              <p>Email:</p>
              <p
                className="email-ver-status"
                style={{ color: user.isEmailVerified ? 'green' : 'orange' }}
              >
                <Image
                  src={user.isEmailVerified ? '/assets/check.png' : '/assets/warning.png'}
                  alt={user.isEmailVerified ? 'Verified' : 'Not Verified'}
                  width={14}
                  height={14}
                  className="email-verification-icon"
                />
                {user.isEmailVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>
            <input type="email" value={user.email} className="profile-input" disabled />
            {!user.isEmailVerified && (
              <button
                className="resend-verification-button"
                disabled={loading}
                onClick={resendVerificationEmail}
              >
                Resend Verification Email
              </button>
            )}
            <hr />
          </div>
          <div className="profile-setting-field">
            <p>Password:</p>
            <input type="password" value="********" className="profile-input" disabled />
            <hr />
          </div>
        </div>
        <div className="profile-settings-container" style={{ height: '25%' }}>
          <div className="profile-setting-field" style={{ maxWidth: '40%', height: '100%' }}>
            <p>Bio:</p>
            <textarea
              name="bio"
              value={form.bio}
              className="profile-textarea"
              style={{ height: '100%' }}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

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
    username: string;
    email: string;
    bio: string;
    image: string;
    wallCommentsPrivacy: string;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handleProfileSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  resendVerificationEmail: () => void;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  return (
    <div className="settings-page">
      <h2>Profile</h2>
      <hr />

      <div
        id="profile-banner-container"
        style={{
          backgroundImage:
            user.backgroundType === 'image' ? `url(${user.backgroundImage})` : 'none',
          backgroundColor:
            user.backgroundType === 'gradient'
              ? `linear-gradient(${user.gradientStartRgb}, ${user.gradientEndRgb})`
              : 'transparent',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div id="profile-banner-overlay">
          <div id="profile-banner-content">
            <div id="profile-image-container">
              <Image
                src={user.image}
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
                {user.tags && user.tags.length > 0 ? (
                  user.tags.map((tag, index) => (
                    <span key={index} className="profile-tag">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="profile-tag">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

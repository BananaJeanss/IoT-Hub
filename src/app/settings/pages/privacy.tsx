'use client';

import './profile.css';
import React from 'react';

interface PrivacyPageProps {
  user: {
    username: string;
    email: string;
    image?: string;
    bio?: string;
    tags?: string[];
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
  loading: boolean;
}

export default function PrivacyPage({ form, handleChange }: PrivacyPageProps) {
  return (
    <div className="settings-page">
      <h1>Privacy</h1>
      <hr id="settings-hr" />
      <div className="profile-settings-container">
        <div className="profile-setting-field" style={{ width: '100%', maxWidth: '40%' }}>
          <p>Wall Comments</p>
          <select
            name="wallCommentsPrivacy"
            value={form.wallCommentsPrivacy}
            onChange={handleChange}
            className="settings-select"
            title="Who can comment on your wall?"
          >
            <option value="public">Everyone can comment</option>
            <option value="followers">Only I can comment</option>
          </select>
          <hr />
        </div>
      </div>
    </div>
  );
}

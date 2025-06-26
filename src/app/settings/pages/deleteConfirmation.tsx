'use client';

import { useState } from 'react';
import './deleteConfirmation.css';

interface DeleteConfirmationModalProps {
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  username,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const [inputUsername, setInputUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputUsername !== username) {
      setError('Username does not match. Please enter your exact username.');
      return;
    }

    onConfirm();
  };

  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation-modal">
        <h1>⚠️ Delete Account</h1>
        <p className="warning-text">
          This action <strong>cannot be undone</strong>. This will permanently delete your account
          and all associated data.
        </p>

        <div className="deletion-details">
          <p>The following will be permanently deleted:</p>
          <ul>
            <li>Your profile and all personal information</li>
            <li>All your projects and guides</li>
            <li>Your posts, comments, and wall activity</li>
            <li>All your stars and interactions</li>
            <li>Account settings and preferences</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="confirmation-form">
          <label htmlFor="username-confirmation">
            Please type <strong>{username}</strong> to confirm:
          </label>
          <input
            id="username-confirmation"
            type="text"
            value={inputUsername}
            onChange={(e) => {
              setInputUsername(e.target.value);
              setError('');
            }}
            placeholder="Enter your username"
            className={error ? 'error' : ''}
            autoComplete="off"
            autoFocus
          />
          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button
              type="submit"
              className="delete-btn-confirmation"
              disabled={inputUsername !== username}
            >
              Delete my account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

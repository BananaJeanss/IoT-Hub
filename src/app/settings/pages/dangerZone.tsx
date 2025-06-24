'use client';

import './profile.css';
import React, { useState } from 'react';
import DeleteConfirmationModal from './deleteConfirmation';

interface DangerZoneProps {
  username: string;
  deleteAccount: () => void;
}

export default function DangerZone({ username, deleteAccount }: DangerZoneProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    deleteAccount();
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="settings-page">
        <h1>Danger Zone</h1>
        <hr id="settings-hr" />
        <div className="danger-zone-container">
          <h2>Delete Account</h2>
          <p>Deleting your account is permanent and cannot be undone.</p>
          <p>What will be deleted:</p>
          <ul>
            <li>Your profile and all associated data</li>
            <li>Your posts, comments, and stars</li>
            <li>All your settings and preferences</li>
          </ul>
          <br />
          <button
            className="danger-zone-button"
            onClick={handleDeleteClick}
            title="Delete your account permanently"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          username={username}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
}

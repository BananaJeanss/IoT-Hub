'use client';

import React from 'react';
import './profile.css';
import './unsavedChanges.css';

interface UnsavedChangesProps {
  unsavedChanges: boolean;
  saveChanges: () => void;
  discardChanges: () => void;
}

export default function UnsavedChanges({
  unsavedChanges,
  saveChanges,
  discardChanges,
}: UnsavedChangesProps) {
  return (
    <div className={`unsaved-changes-banner ${unsavedChanges ? 'visible' : ''}`}>
      <p>You have unsaved changes!</p>
      <button onClick={discardChanges} className="discard-button">
        Discard Changes
      </button>
      <button onClick={saveChanges} className="save-button">
        Save Changes
      </button>
    </div>
  );
}

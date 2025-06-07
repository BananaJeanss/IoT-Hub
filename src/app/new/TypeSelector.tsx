'use client';

import React from 'react';

interface TypeSelectorProps {
  onTypeSelection: (type: 'project' | 'guide') => void;
}

export default function TypeSelector({ onTypeSelection }: TypeSelectorProps) {
  return (
    <div className="post-type-selector">
      <button
        className="post-type-button project-button"
        onClick={() => onTypeSelection('project')}
      >
        <div className="button-icon">🔧</div>
        <h2>Create Project</h2>
        <p>Share your IoT project with detailed documentation, code, and build instructions.</p>
        <div className="button-features">
          <span>• DIY Projects</span>
          <span>• Your shipped project</span>
          <span>• Other interesting projects</span>
        </div>
      </button>
      <button className="post-type-button guide-button" onClick={() => onTypeSelection('guide')}>
        <div className="button-icon">📚</div>
        <h2>Create Guide</h2>
        <p>Write a comprehensive tutorial or guide to help others learn IoT concepts.</p>
        <div className="button-features">
          <span>• Tutorials</span>
          <span>• How-to Guides</span>
          <span>• Educational Content</span>
        </div>
      </button>{' '}
      <button
        className="drafts-button"
        onClick={() => {
          // TODO: Implement drafts functionality
          console.log('Opening drafts...');
        }}
      >
        <div className="button-icon">📝</div>
        <h2>Drafts</h2>
        <p>View and continue your saved drafts</p>
      </button>
    </div>
  );
}

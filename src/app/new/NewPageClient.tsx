'use client';

import React, { useState } from 'react';
import './newpost.css';
import ProjectForm from './ProjectForm';
import GuideForm from './GuideForm';
import TypeSelector from './TypeSelector';
import { useSession } from 'next-auth/react';

export default function NewPageClient() {
  const [selectedType, setSelectedType] = useState<'project' | 'guide' | 'post'>('post');
  const { data: session } = useSession();

  const handleTypeSelection = (type: 'project' | 'guide') => {
    setSelectedType(type);
  };

  const goBack = () => {
    setSelectedType('post');
  };

  if (selectedType === 'project' || selectedType === 'guide') {
    return (
      <div id="main">
        <div id="content" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={goBack}
              style={{
                background: 'transparent',
                border: '2px solid var(--main-color)',
                color: 'var(--main-color)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--main-color)';
                e.currentTarget.style.color = 'var(--secondary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--main-color)';
              }}
            >
              ← Back to Selection
            </button>
          </div>
          {selectedType === 'project' ? (
            <ProjectForm name={session?.user?.name || ''} image={session?.user?.image || ''} />
          ) : (
            <GuideForm username={session?.user?.name || ''} image={session?.user?.image || ''} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="main">
      <div id="hero">
        <div id="hero-container">
          <div id="right-half" style={{ textAlign: 'center' }}>
            <div className="glow-bg"></div>
            <h1>Create New Post</h1>
            <p>Share your IoT project with the community.</p>
          </div>
        </div>
      </div>
      <div id="content">
        <div className="content-container">
          <TypeSelector onTypeSelection={handleTypeSelection} />
        </div>
      </div>
    </div>
  );
}

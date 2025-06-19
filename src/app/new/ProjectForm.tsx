'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { markdownToSafeHtml, sanitizeUserContent } from '@/lib/markdownUtils';
import './ProjectForm.css';
import { useToast } from '@/components/ToastContext';

interface ProjectData {
  title: string;
  description: string;
  content: string;
  tags: string[];
  image: string | null;
  links: { name: string; url: string }[];
  backgroundType: 'image' | 'gradient';
  gradientStart: string;
  gradientEnd: string;
}

export default function ProjectForm() {
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    description: '',
    content:
      '# Overview\n\nBrief description of your project.\n\n## Features\n\n- Feature 1\n- Feature 2\n\n## Setup\n\n```bash\ngit clone your-repo\n```\n\nAdd more details here...',
    tags: [],
    image: null,
    links: [],
    backgroundType: 'gradient',
    gradientStart: '#00b7ff',
    gradientEnd: '#b3ffec',
  });
  const [newTag, setNewTag] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview] = useState(true);
  const [contentCharCount, setContentCharCount] = useState(projectData.content.length);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Enhanced validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!projectData.title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (projectData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!projectData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (projectData.description.length > 300) {
      newErrors.description = 'Description must be 300 characters or less';
    }

    if (!projectData.content.trim()) {
      newErrors.content = 'Project content is required';
    } else if (projectData.content.length > 10000) {
      newErrors.content = 'Content must be 10,000 characters or less';
    }

    // Validate tags
    const MAX_TAG_LENGTH = 25;
    const MAX_TAGS = 5;

    if (projectData.tags.length > MAX_TAGS) {
      newErrors.tags = `Cannot have more than ${MAX_TAGS} tags`;
    } else {
      for (const tag of projectData.tags) {
        if (tag.length > MAX_TAG_LENGTH) {
          newErrors.tags = `Tag "${tag}" exceeds maximum length of ${MAX_TAG_LENGTH} characters`;
          break;
        }
        if (!/^[a-zA-Z0-9\s\-_\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}]+$/u.test(tag)) {
          newErrors.tags = `Tag "${tag}" contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and emojis are allowed.`;
          break;
        }
      }
    }

    // Validate links
    for (const link of projectData.links) {
      if (!link.name.trim() || !link.url.trim()) {
        newErrors.links = 'All links must have both name and URL';
        break;
      }
      if (link.name.trim().length > 50) {
        newErrors.links = `Link name "${link.name}" is too long (max 50 characters)`;
        break;
      }
      try {
        const url = new URL(link.url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.links = `URL "${link.url}" must use http:// or https://`;
          break;
        }
      } catch {
        newErrors.links = `Invalid URL: ${link.url}`;
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof ProjectData,
    value: string | string[] | null | { name: string; url: string }[],
  ) => {
    // Only sanitize markdown content, not title/description
    if (typeof value === 'string' && field === 'content') {
      value = sanitizeUserContent(value);
    }

    setProjectData((prev) => ({ ...prev, [field]: value }));

    // Update character count for content
    if (field === 'content' && typeof value === 'string') {
      setContentCharCount(value.length);
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    const MAX_TAG_LENGTH = 25;
    const MAX_TAGS = 5;

    if (!trimmedTag) {
      return;
    }

    if (trimmedTag.length > MAX_TAG_LENGTH) {
      showToast({
        message: `Tag "${trimmedTag}" exceeds maximum length of ${MAX_TAG_LENGTH} characters`,
        type: 'error',
      });
      return;
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\s\-_\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}]+$/u.test(trimmedTag)) {
      showToast({
        message: `Tag "${trimmedTag}" contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and emojis are allowed.`,
        type: 'error',
      });
      return;
    }

    if (projectData.tags.includes(trimmedTag)) {
      showToast({
        message: `Tag "${trimmedTag}" is already added`,
        type: 'error',
      });
      return;
    }

    if (projectData.tags.length >= MAX_TAGS) {
      showToast({
        message: `A maximum of ${MAX_TAGS} tags can be added.`,
        type: 'error',
      });
      return;
    }

    handleInputChange('tags', [...projectData.tags, trimmedTag]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      'tags',
      projectData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const addLink = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      // Validate URL before adding
      try {
        const url = new URL(newLinkUrl.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          showToast({
            message: `URL "${newLinkUrl}" must use http:// or https://`,
            type: 'error',
          });
          return;
        }
      } catch {
        showToast({
          message: `Please use a valid URL: ${newLinkUrl}`,
          type: 'error',
        });
        return;
      }

      if (newLinkName.trim().length > 50) {
        showToast({
          message: `Link name "${newLinkName}" is too long (max 50 characters)`,
          type: 'error',
        });
        return;
      }

      handleInputChange('links', [
        ...projectData.links,
        { name: newLinkName.trim(), url: newLinkUrl.trim() },
      ]);
      setNewLinkName('');
      setNewLinkUrl('');
    } else {
      showToast({
        // todo: maybe automate link name if only url is provided
        message: 'Both link name and URL are required',
        type: 'error',
      });
    }
  };

  const removeLink = (index: number) => {
    handleInputChange(
      'links',
      projectData.links.filter((_, i) => i !== index),
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('image', e.target?.result as string);
        handleInputChange('backgroundType', 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    handleInputChange('image', null);
    handleInputChange('backgroundType', 'gradient');
  };

  const handleGradientChange = (type: 'start' | 'end', color: string) => {
    if (type === 'start') {
      handleInputChange('gradientStart', color);
    } else {
      handleInputChange('gradientEnd', color);
    }
    handleInputChange('backgroundType', 'gradient');
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: projectData.title,
          description: projectData.description,
          content: projectData.content,
          tags: projectData.tags,
          image: projectData.image,
          links: projectData.links,
          backgroundType: projectData.backgroundType,
          gradientStart: projectData.gradientStart,
          gradientEnd: projectData.gradientEnd,
          isDraft,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      // Redirect to the created project
      window.location.href = `/projects/${data.project.slug}`;
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create project',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Using secure markdown utility instead of custom formatMarkdown

  return (
    <div className="live-editor-container">
      <div className="editor-panel">
        <div className="editor-section">
          <h3>Project Details</h3>
          <div className="form-group">
            <label>Project Title</label>
            <input
              type="text"
              value={projectData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter project title..."
              className={errors.title ? 'error' : ''}
              maxLength={100}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
            <div
              className={`char-count ${projectData.title.length > 80 ? 'danger' : projectData.title.length > 60 ? 'warning' : ''}`}
              style={{
                textAlign: 'right',
                fontSize: '12px',
                color:
                  projectData.title.length > 80
                    ? '#e74c3c'
                    : projectData.title.length > 60
                      ? '#f39c12'
                      : '#888',
              }}
            >
              {projectData.title.length}/100 characters
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={projectData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of your project..."
              rows={3}
              className={errors.description ? 'error' : ''}
              maxLength={300}
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
            <div
              className={`char-count ${projectData.description.length > 250 ? 'danger' : projectData.description.length > 200 ? 'warning' : ''}`}
              style={{
                textAlign: 'right',
                fontSize: '12px',
                color:
                  projectData.description.length > 250
                    ? '#e74c3c'
                    : projectData.description.length > 200
                      ? '#f39c12'
                      : '#888',
              }}
            >
              {projectData.description.length}/300 characters
            </div>
          </div>
          <div className="form-group">
            <label>Project Banner</label>
            <div className="banner-preview">
              {projectData.backgroundType === 'image' && projectData.image ? (
                <Image
                  src={projectData.image}
                  alt="Project Banner"
                  className="banner-img"
                  width={800}
                  height={200}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              ) : (
                <div
                  className="banner-gradient"
                  style={{
                    background: `linear-gradient(135deg, ${projectData.gradientStart}, ${projectData.gradientEnd})`,
                    width: '100%',
                    height: '100%',
                  }}
                />
              )}
              <div className="banner-buttons">
                {projectData.image && projectData.backgroundType === 'image' ? (
                  <button type="button" onClick={handleRemoveImage} className="banner-btn">
                    Remove Image
                  </button>
                ) : (
                  <label className="banner-btn">
                    Upload Image
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => handleInputChange('backgroundType', 'gradient')}
                  className="banner-btn"
                >
                  Use Gradient
                </button>
              </div>
            </div>
            {projectData.backgroundType === 'gradient' && (
              <div className="gradient-picker">
                <label>Start Color:</label>
                <input
                  type="color"
                  value={projectData.gradientStart}
                  onChange={(e) => handleGradientChange('start', e.target.value)}
                />
                <label>End Color:</label>
                <input
                  type="color"
                  value={projectData.gradientEnd}
                  onChange={(e) => handleGradientChange('end', e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Tags ({projectData.tags.length}/5)</label>
            <div className="selected-tags">
              {projectData.tags.map((tag, index) => (
                <span key={index} className="tag-chip">
                  {tag}
                  <button type="button" className="tag-remove-btn" onClick={() => removeTag(tag)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input-row">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                maxLength={25}
                disabled={projectData.tags.length >= 5}
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-secondary"
                disabled={projectData.tags.length >= 5}
              >
                Add
              </button>
            </div>
            {newTag && (
              <small
                style={{
                  color: newTag.length > 25 ? '#e74c3c' : newTag.length > 20 ? '#f39c12' : '#888',
                  fontSize: '11px',
                  marginTop: '0.25rem',
                  display: 'block',
                }}
              >
                {newTag.length}/25 characters
              </small>
            )}
            {errors.tags && <div className="error-message">{errors.tags}</div>}
          </div>
          <div className="form-group">
            <label>Links</label>
            {projectData.links.map((link, index) => (
              <div key={index} className="link-item">
                <span>
                  {link.name}: {link.url}
                </span>
                <button type="button" className="tag-remove-btn" onClick={() => removeLink(index)}>
                  ×
                </button>
              </div>
            ))}
            <div className="link-input-row">
              <input
                type="text"
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                placeholder="Link name (e.g., GitHub)"
                maxLength={50}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />
              <input
                type="url"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="URL"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />
              <button type="button" onClick={addLink} className="btn btn-secondary">
                Add
              </button>
            </div>
            {newLinkName && (
              <small
                style={{
                  color:
                    newLinkName.length > 40
                      ? '#e74c3c'
                      : newLinkName.length > 30
                        ? '#f39c12'
                        : '#888',
                  fontSize: '11px',
                  marginTop: '0.25rem',
                  display: 'block',
                }}
              >
                Link name: {newLinkName.length}/50 characters
              </small>
            )}
          </div>{' '}
          <div className="form-group">
            <label>Content (Markdown)</label>
            <textarea
              value={projectData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your project details in Markdown..."
              rows={15}
              className={`markdown-editor ${errors.content ? 'error' : ''}`}
            />
            {errors.content && <div className="error-message">{errors.content}</div>}
            <div
              className={`char-count ${contentCharCount > 8000 ? 'danger' : contentCharCount > 6000 ? 'warning' : ''}`}
              style={{
                textAlign: 'right',
                fontSize: '12px',
                color:
                  contentCharCount > 8000
                    ? '#e74c3c'
                    : contentCharCount > 6000
                      ? '#f39c12'
                      : '#888',
              }}
            >
              {contentCharCount}/10,000 characters
            </div>
          </div>
          <div className="form-actions">
            {errors.submit && <div className="error-message">{errors.submit}</div>}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Project'}
            </button>
          </div>
        </div>
      </div>

      <div className="preview-panel">
        {showPreview && (
          <div className="project-preview">
            <div id="project-container">
              <div id="project-cont2">
                <div id="project-header">
                  <div
                    id="project-upper-header"
                    style={{
                      ...(projectData.backgroundType === 'image' && projectData.image
                        ? {
                            backgroundImage: `url(${projectData.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                          }
                        : {
                            backgroundImage: `linear-gradient(135deg, ${projectData.gradientStart}, ${projectData.gradientEnd})`,
                          }),
                    }}
                  >
                    {/* Image content handled by background */}
                  </div>{' '}
                  <div id="project-lower-header">
                    <h1>{projectData.title || 'Untitled Project'}</h1>
                    <p>{projectData.description || 'No description provided.'}</p>
                    <div id="tags">
                      {projectData.tags.length > 0 ? (
                        projectData.tags.map((tag, index) => <p key={index}>{tag}</p>)
                      ) : (
                        <p style={{ opacity: 0.5 }}>No tags added</p>
                      )}
                    </div>
                  </div>
                </div>
                <hr className="horizontal" />
                <div id="project-contents">
                  {' '}
                  <div id="project-contents-left">
                    {projectData.content ? (
                      <div
                        className="markdown-content"
                        dangerouslySetInnerHTML={{
                          __html: markdownToSafeHtml(projectData.content),
                        }}
                      />
                    ) : (
                      <div style={{ opacity: 0.5, fontStyle: 'italic' }}>
                        <p>No content added yet. Write your project details in the editor.</p>
                      </div>
                    )}
                  </div>
                  <hr />
                  <div id="project-contents-right">
                    <div id="project-contents-details">
                      <h2>Details</h2>
                      <p>👤 Your Username</p>
                      <p>⭐ New Project</p>
                      <p>👁️ 0 views</p>
                      <p>📅 {new Date().toLocaleDateString()}</p>{' '}
                      <div id="tags">
                        {projectData.tags.length > 0 ? (
                          projectData.tags.map((tag, index) => <p key={index}>{tag}</p>)
                        ) : (
                          <p style={{ opacity: 0.5 }}>No tags</p>
                        )}
                      </div>
                      {projectData.links.length > 0 ? (
                        <>
                          <h3>Links</h3>
                          {projectData.links.map((link, index) => (
                            <p key={index}>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                🔗 {link.name}
                              </a>
                            </p>
                          ))}
                        </>
                      ) : (
                        <>
                          <h3>Links</h3>
                          <p style={{ opacity: 0.5 }}>No links added</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

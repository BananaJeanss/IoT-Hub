'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { markdownToSafeHtml, sanitizeUserContent } from '@/lib/markdownUtils';
import { useToast } from '@/components/ToastContext';

interface GuideData {
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

export default function GuideForm() {
  const router = useRouter();
  const [guideData, setGuideData] = useState<GuideData>({
    title: '',
    description: '',
    content:
      '# Introduction\n\nWelcome to this guide!\n\n## Step 1\n\nFirst step description...\n\n```bash\ncommand-example\n```\n\n## Step 2\n\nSecond step description...',
    tags: [],
    image: null,
    links: [],
    backgroundType: 'gradient',
    gradientStart: '#00b7ff',
    gradientEnd: '#b3ffec',
  });

  const [newTag, setNewTag] = useState('');
  const [newLink, setNewLink] = useState({ name: '', url: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!guideData.title.trim()) {
      newErrors.title = 'Guide title is required';
    }

    if (!guideData.description.trim()) {
      newErrors.description = 'Guide description is required';
    }

    if (!guideData.content.trim()) {
      newErrors.content = 'Guide content is required';
    }

    // Validate tags
    const MAX_TAG_LENGTH = 25;
    for (const tag of guideData.tags) {
      if (tag.length > MAX_TAG_LENGTH) {
        newErrors.tags = `Tag "${tag}" exceeds maximum length of ${MAX_TAG_LENGTH} characters`;
        break;
      }
      if (!/^[a-zA-Z0-9\s\-_\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}]+$/u.test(tag)) {
        newErrors.tags = `Tag "${tag}" contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and emojis are allowed.`;
        break;
      }
    }

    // Validate links
    for (const link of guideData.links) {
      if (link.name && !link.url) {
        newErrors.links = `Link name "${link.name}" requires a URL`;
        break;
      }
      if (link.url && !link.name) {
        newErrors.links = `Link URL "${link.url}" requires a name`;
        break;
      }
      if (link.url && !/^https?:\/\/.+\..+/.test(link.url)) {
        newErrors.links = `"${link.url}" is not a valid URL. URLs must start with http:// or https://`;
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Handle image upload if there's a new image
      let imageUrl = guideData.image;
      if (guideData.image && guideData.image.startsWith('data:')) {
        const formData = new FormData();
        const response = await fetch(guideData.image);
        const blob = await response.blob();
        formData.append('file', blob, 'guide-image.jpg');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        }
      }

      const payload = {
        ...guideData,
        image: imageUrl,
        published: !isDraft,
      };

      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save guide');
      }

      const result = await response.json();

      if (isDraft) {
        showToast({
          message: 'Guide saved as draft successfully!',
          type: 'success',
        });
      } else {
        // Generate slug from title if not provided by API
        const slug =
          result.slug ||
          guideData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        router.push(`/guides/${slug}`);
      }
    } catch (error) {
      console.error('Error saving guide:', error);
      showToast({
        message: error instanceof Error ? error.message : 'Failed to save guide',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit(true);
  };

  const handlePublish = () => {
    handleSubmit(false);
  };

  const handleInputChange = (
    field: keyof GuideData,
    value: string | string[] | null | { name: string; url: string }[],
  ) => {
    // Only sanitize markdown content, not title/description
    if (typeof value === 'string' && field === 'content') {
      value = sanitizeUserContent(value);
    }

    setGuideData((prev) => ({ ...prev, [field]: value }));
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
        message: `Tag cannot exceed ${MAX_TAG_LENGTH} characters`,
        type: 'error',
      });
      return;
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\s\-_\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}]+$/u.test(trimmedTag)) {
      showToast({
        message: 'Tags can only contain letters, numbers, spaces, hyphens, underscores, and emojis',
        type: 'error',
      });
      return;
    }

    if (guideData.tags.includes(trimmedTag)) {
      showToast({
        message: 'This tag is already added',
        type: 'error',
      });
      return;
    }

    if (guideData.tags.length >= MAX_TAGS) {
      showToast({
        message: `Maximum ${MAX_TAGS} tags allowed`,
        type: 'error',
      });
      return;
    }

    handleInputChange('tags', [...guideData.tags, trimmedTag]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      'tags',
      guideData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const addLink = () => {
    if (newLink.name.trim() && newLink.url.trim()) {
      if (!/^https?:\/\/.+\..+/.test(newLink.url)) {
        showToast({
          message: 'Please enter a valid URL (must start with http:// or https://)',
          type: 'error',
        });
        return;
      }
      handleInputChange('links', [...guideData.links, { ...newLink }]);
      setNewLink({ name: '', url: '' });
    }
  };

  const removeLink = (index: number) => {
    handleInputChange(
      'links',
      guideData.links.filter((_, i) => i !== index),
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

  const handleGradientChange = useCallback((type: 'start' | 'end', color: string) => {
    setGuideData((prev) => ({
      ...prev,
      [type === 'start' ? 'gradientStart' : 'gradientEnd']: color,
      backgroundType: 'gradient',
    }));
  }, []);

  // Using secure markdown utility instead of custom formatMarkdown

  return (
    <div className="live-editor-container">
      <div className="editor-panel">
        <div className="editor-section">
          <h3>Guide Details</h3>{' '}
          <div className="form-group">
            <label className="required">Guide Title</label>
            <input
              type="text"
              value={guideData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter guide title..."
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label className="required">Description</label>
            <textarea
              value={guideData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief overview of what readers will learn..."
              rows={3}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
          <div className="form-group">
            <label>Guide Banner</label>
            <div className="banner-preview">
              {guideData.backgroundType === 'image' && guideData.image ? (
                <Image
                  src={guideData.image}
                  alt="Guide Banner"
                  className="banner-img"
                  width={800}
                  height={200}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              ) : (
                <div
                  className="banner-gradient"
                  style={{
                    background: `linear-gradient(135deg, ${guideData.gradientStart}, ${guideData.gradientEnd})`,
                    width: '100%',
                    height: '100%',
                  }}
                />
              )}
              <div className="banner-buttons">
                {guideData.image && guideData.backgroundType === 'image' ? (
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
            {guideData.backgroundType === 'gradient' && (
              <div className="gradient-picker">
                <label>Start Color:</label>
                <input
                  type="color"
                  value={guideData.gradientStart}
                  onChange={(e) => handleGradientChange('start', e.target.value)}
                />
                <label>End Color:</label>
                <input
                  type="color"
                  value={guideData.gradientEnd}
                  onChange={(e) => handleGradientChange('end', e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Tags ({guideData.tags.length}/5)</label>
            <div className="selected-tags">
              {guideData.tags.map((tag, index) => (
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
                disabled={guideData.tags.length >= 5}
                className={errors.tags ? 'error' : ''}
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-secondary"
                disabled={guideData.tags.length >= 5}
                style={{
                  opacity: !newTag.trim() || newTag.length > 25 ? 0.5 : 1,
                  cursor:
                    !newTag.trim() || newTag.length > 25 || guideData.tags.length >= 5
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                Add
              </button>
            </div>
            <div className="tag-input-info">
              <span
                className="character-count"
                style={{ color: newTag.length > 25 ? 'red' : '#888' }}
              >
                {newTag.length}/25
              </span>
              {guideData.tags.length >= 5 && (
                <span style={{ color: '#888', fontSize: '0.9rem' }}>Maximum tags reached</span>
              )}
            </div>
            {errors.tags && <div className="error-message">{errors.tags}</div>}
          </div>
          <div className="form-group">
            <label>Links</label>
            <div className="links-list">
              {guideData.links.map((link, index) => (
                <div key={index} className="link-item">
                  <span className="link-name">{link.name}</span>
                  <span className="link-url">{link.url}</span>
                  <button
                    type="button"
                    className="link-remove-btn"
                    onClick={() => removeLink(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="link-input-group">
              <input
                type="text"
                value={newLink.name}
                onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                placeholder="Link name (e.g., GitHub Repository)"
                className="link-name-input"
              />
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://example.com"
                className="link-url-input"
              />
              <button
                type="button"
                onClick={addLink}
                className="btn btn-secondary"
                style={{
                  opacity: !newLink.name.trim() || !newLink.url.trim() ? 0.5 : 1,
                  cursor: !newLink.name.trim() || !newLink.url.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                Add Link
              </button>
            </div>
            {errors.links && <div className="error-message">{errors.links}</div>}
          </div>
          <div className="form-group">
            <label className="required">Content (Markdown)</label>
            <textarea
              value={guideData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your guide content in Markdown..."
              rows={20}
              className={`markdown-editor ${errors.content ? 'error' : ''}`}
            />
            {errors.content && <div className="error-message">{errors.content}</div>}
          </div>{' '}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Guide'}
            </button>
          </div>
        </div>
      </div>

      <div className="preview-panel">
        <div className="guide-preview">
          <div className="guide-container">
            <div className="guide-header">
              <div
                className="guide-upper-header"
                style={
                  guideData.backgroundType === 'image' && guideData.image
                    ? {
                        backgroundImage: `url(${guideData.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }
                    : {
                        backgroundImage: `linear-gradient(135deg, ${guideData.gradientStart}, ${guideData.gradientEnd})`,
                      }
                }
              >
                {/* Image content handled by background */}
              </div>{' '}
              <div
                className="guide-lower-header"
                style={{
                  background: 'var(--tertiary-color)',
                  padding: '20px 50px',
                  borderRadius: '0 0 25px 25px',
                }}
              >
                <h1 style={{ color: 'var(--secondary-color)', marginBottom: '10px' }}>
                  {guideData.title || 'Your Guide Title'}
                </h1>
                <p
                  style={{
                    color: 'var(--secondary-color)',
                    marginBottom: '15px',
                    fontSize: '1.1rem',
                  }}
                >
                  {guideData.description || 'Your guide description will appear here...'}
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {guideData.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        background: 'var(--background-color)',
                        color: 'var(--secondary-color)',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        border: '1px solid #444',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="guide-content"
              style={{
                background: 'var(--tertiary-color)',
                padding: '30px 50px',
                borderRadius: '25px',
                marginTop: '20px',
              }}
            >
              <div
                className="guide-meta"
                style={{
                  marginBottom: '20px',
                  paddingBottom: '20px',
                  borderBottom: '2px solid var(--background-color)',
                  display: 'flex',
                  gap: '20px',
                  fontSize: '0.9rem',
                  color: '#888',
                }}
              >
                <span>👤 Your Username</span>
                <span>📅 {new Date().toLocaleDateString()}</span>
                <span>👁️ 0 views</span>
              </div>
              <div
                className="markdown-content guide-markdown"
                dangerouslySetInnerHTML={{
                  __html: markdownToSafeHtml(
                    guideData.content ||
                      '# Your Guide Content\n\nStart writing your guide content above to see it rendered here...',
                  ),
                }}
                style={{ color: 'var(--secondary-color)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

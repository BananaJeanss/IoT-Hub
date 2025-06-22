'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';
import Image from 'next/image';
import { useToast } from '@/components/ToastContext';

export default function EditProfileModal({
  user,
  onClose,
}: {
  user: User & { tags?: string[] };
  onClose: () => void;
}) {
  const [bio, setBio] = useState(user.bio ?? '');
  const [tags, setTags] = useState<string[]>(user.tags ?? []);
  const [backgroundType, setBackgroundType] = useState(user.backgroundType ?? 'gradient');
  const [gradientStart, setGradientStart] = useState(
    user.gradientStartRgb
      ? user.gradientStartRgb.startsWith('#')
        ? user.gradientStartRgb
        : rgbToHex(user.gradientStartRgb)
      : '#00b7ff',
  );
  const [gradientEnd, setGradientEnd] = useState(
    user.gradientEndRgb
      ? user.gradientEndRgb.startsWith('#')
        ? user.gradientEndRgb
        : rgbToHex(user.gradientEndRgb)
      : '#b3ffec',
  );
  const [banner, setBanner] = useState<string | null>(user.backgroundImage ?? null);

  const [pfp, setPfp] = useState<string | null>(user.image ?? null);

  const [tagSearch, setTagSearch] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const { showToast } = useToast();

  const router = useRouter();

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Fetch popular/existing tags from API
  useEffect(() => {
    const fetchTags = async () => {
      const res = await fetch('/api/tags/popular');
      if (res.ok) {
        const data = await res.json();
        setAvailableTags(data.tags);
      }
    };
    fetchTags();
  }, []);

  const filteredTags = availableTags.filter(
    (tag) => tag.toLowerCase().includes(tagSearch.toLowerCase()) && !tags.includes(tag),
  );

  const handleRemoveBanner = () => {
    setBanner(null);
    setBackgroundType('gradient');
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (res.ok && data.url) {
      setBanner(data.url);
      setBackgroundType('image');
    } else {
      showToast({
        message: 'Banner upload failed, try again later.',
        type: 'error',
      });
    }
  };

  const handlePfpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (res.ok && data.url) {
      setPfp(data.url);
    } else {
      showToast({
        message: 'Profile picture upload failed, try again later.',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation for tags
    const MAX_TAG_LENGTH = 25;
    for (const tag of tags) {
      if (tag.length > MAX_TAG_LENGTH) {
        showToast({
          message: `Tag "${tag}" cannot exceed ${MAX_TAG_LENGTH} characters.`,
          type: 'error',
        });
        return;
      }
      if (!/^[a-zA-Z0-9\s\-_\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}]+$/u.test(tag)) {
        showToast({
          message: `Tag "${tag}" contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and emojis are allowed.`,
          type: 'error',
        });
        return;
      }
    }

    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio,
        tags,
        image: pfp,
        backgroundImage: backgroundType === 'image' ? banner : null,
        backgroundType,
        gradientStartRgb: backgroundType === 'gradient' ? gradientStart : null,
        gradientEndRgb: backgroundType === 'gradient' ? gradientEnd : null,
      }),
    });

    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      showToast({
        message: 'Failed to update profile. Please try again later.',
        type: 'error',
      });
    }
  };

  // Add custom tag functionality
  const addCustomTag = () => {
    const trimmedTag = tagSearch.trim();
    const MAX_TAG_LENGTH = 25;

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
        message: `Tag "${trimmedTag}" contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and emojis are allowed.`,
        type: 'error',
      });
      return;
    }

    if (tags.includes(trimmedTag)) {
      showToast({
        message: `Tag "${trimmedTag}" is already added.`,
        type: 'error',
      });
      return;
    }

    if (tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagSearch('');
      setShowTagDropdown(false);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    const MAX_TAG_LENGTH = 25;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        // Add first suggestion
        const firstTag = filteredTags[0];
        if (firstTag.length > MAX_TAG_LENGTH) {
          showToast({
            message: `Tag "${firstTag}" cannot exceed ${MAX_TAG_LENGTH} characters`,
            type: 'error',
          });
          return;
        }
        if (tags.length < 5 && !tags.includes(firstTag)) {
          setTags([...tags, firstTag]);
          setTagSearch('');
          setShowTagDropdown(false);
        }
      } else if (tagSearch.trim()) {
        // Add custom tag
        addCustomTag();
      }
    } else if (e.key === 'Escape') {
      setShowTagDropdown(false);
      setTagSearch('');
    }
  };

  // turn rgb to hex for gradient picker
  function rgbToHex(rgb: string) {
    const result = rgb.match(/\d+/g);
    if (!result) return '#000000';
    return (
      '#' +
      result
        .slice(0, 3)
        .map((x) => (+x).toString(16).padStart(2, '0'))
        .join('')
    );
  }

  return (
    <div className="overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>Edit Profile</h2>

        <div className="banner‐pfp‐wrapper">
          <div className="banner-preview">
            {backgroundType === 'image' && banner ? (
              <Image
                src={banner}
                alt="banner preview"
                width={600}
                height={200}
                className="banner-img"
                unoptimized
                onError={() => {
                  setBanner(null);
                  setBackgroundType('gradient');
                }}
              />
            ) : (
              <div
                className="banner-gradient"
                style={{
                  background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                }}
              />
            )}
            <div className="profile-bg-overlay" style={{ borderRadius: 0 }}></div>
            <div className="banner-buttons">
              {banner ? (
                <button type="button" onClick={handleRemoveBanner}>
                  Remove Banner
                </button>
              ) : (
                <label>
                  Upload Banner
                  <input type="file" accept="image/*" onChange={handleBannerUpload} hidden />
                </label>
              )}
              <button type="button" onClick={() => setBackgroundType('gradient')}>
                Change Gradient
              </button>
              {backgroundType === 'gradient' && (
                <div className="gradient-picker">
                  <input
                    type="color"
                    value={gradientStart}
                    onChange={(e) => setGradientStart(e.target.value)}
                  />
                  <input
                    type="color"
                    value={gradientEnd}
                    onChange={(e) => setGradientEnd(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pfp-upload-container">
            <label className="pfp-preview" style={{ cursor: 'pointer' }}>
              <Image
                src={pfp || '/assets/user.png'}
                alt="Profile picture"
                width={96}
                height={96}
                className="pfp-img"
                unoptimized
              />
              <input type="file" accept="image/*" onChange={handlePfpUpload} hidden />
              <span id="plus-span">+</span>
            </label>
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input type="text" value={`@${user.username}`} disabled style={{ marginTop: '25px' }} />

          <textarea
            maxLength={160}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us something cool…"
            rows={3}
          />
          <small>{bio.length}/160</small>

          <div className="tag-section">
            <h3 style={{ marginTop: 0 }}>Tags ({tags.length}/5):</h3>

            {/* Selected tags */}
            <div className="selected-tags">
              {tags.map((tag) => (
                <span key={tag} className="selected-tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="remove-tag-btn"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Tag search input */}
            <div className="tag-input-container">
              <input
                type="text"
                placeholder="Search or add tags..."
                value={tagSearch}
                onChange={(e) => {
                  setTagSearch(e.target.value);
                  setShowTagDropdown(true);
                }}
                onFocus={() => setShowTagDropdown(true)}
                className="tag-search-input"
                disabled={tags.length >= 5}
                onKeyDown={handleTagInputKeyDown}
                maxLength={25}
              />
              {tagSearch && (
                <small style={{ color: tagSearch.length > 25 ? 'red' : '#888', fontSize: '11px' }}>
                  {tagSearch.length}/25 characters
                </small>
              )}

              {/* Dropdown with suggestions */}
              {showTagDropdown && tagSearch && (
                <div className="tag-dropdown">
                  {filteredTags.slice(0, 5).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const MAX_TAG_LENGTH = 25;
                        if (tag.length > MAX_TAG_LENGTH) {
                          showToast({
                            message: `Tag "${tag}" cannot exceed ${MAX_TAG_LENGTH} characters`,
                            type: 'error',
                          });
                          return;
                        }
                        if (tags.length < 5 && !tags.includes(tag)) {
                          setTags([...tags, tag]);
                          setTagSearch('');
                          setShowTagDropdown(false);
                        }
                      }}
                      className="tag-suggestion"
                    >
                      {tag}
                    </button>
                  ))}

                  {/* Add custom tag option */}
                  {tagSearch.trim() && !availableTags.includes(tagSearch.trim()) && (
                    <button
                      type="button"
                      onClick={addCustomTag}
                      className="tag-suggestion custom-tag"
                    >
                      Add &quot;{tagSearch.trim()}&quot;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="save-btn">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

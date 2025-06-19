// src/app/user/[username]/WallComponent.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ToastContext';
import Image from 'next/image';
import Link from 'next/link';

interface WallPost {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    image: string | null;
  };
}

interface WallComponentProps {
  wallOwnerId: string;
  isOwner: boolean;
}

export default function WallComponent({ wallOwnerId, isOwner }: WallComponentProps) {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wallPrivacy, setWallPrivacy] = useState<string>('everyone');
  const { data: session } = useSession();

  const fetchWallPrivacy = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/privacy?userId=${wallOwnerId}`);
      if (res.ok) {
        const data = await res.json();
        setWallPrivacy(data.wallCommentsPrivacy || 'everyone');
      }
    } catch (error) {
      console.error('Failed to fetch wall privacy:', error);
      // Default to 'owner-only' if fetch fails
      setWallPrivacy('owner-only');
    }
  }, [wallOwnerId]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wall-posts?wallOwnerId=${wallOwnerId}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, [wallOwnerId]);

  useEffect(() => {
    fetchPosts();
    fetchWallPrivacy();
  }, [fetchPosts, fetchWallPrivacy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !session) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/wall-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPost.trim(),
          wallOwnerId,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        setPosts([post, ...posts]);
        setNewPost('');
      } else {
        const error = await res.json();
        showToast({
          message: error.error || 'Failed to post comment.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to submit post:', error);
      showToast({
        message: 'Failed to submit post. Please try again later.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/wall-posts/${postId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPosts(posts.filter((post) => post.id !== postId));
      } else {
        const error = await res.json();
        showToast({
          message: error.error || 'Failed to delete post.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      showToast({
        message: 'Failed to delete post. Please try again later.',
        type: 'error',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  // Check if current user can comment
  const canComment = () => {
    if (!session) return false;
    if (isOwner) return true; // Owner can always comment
    return wallPrivacy === 'everyone';
  };

  return (
    <div id="activity-container">
      <h2>User Wall</h2>
      <div id="activity">
        {session && canComment() && (
          <div className="activity-card">
            <form onSubmit={handleSubmit}>
              <textarea
                className="comment-input"
                rows={3}
                placeholder="Leave a comment on this wall..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                maxLength={500}
                disabled={submitting}
              />
              <div className="post-actions">
                <small className="char-count">{newPost.length}/500</small>
                <button
                  type="submit"
                  className="comment-button"
                  disabled={!newPost.trim() || submitting}
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {session && !canComment() && wallPrivacy === 'owner-only' && (
          <div className="privacy-notice">
            <p style={{ textAlign: 'center', color: '#888', padding: '20px', fontStyle: 'italic' }}>
              Only the wall owner can post comments on this wall
            </p>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="wall-post">
              <div className="post-header">
                <div className="post-author">
                  <Image
                    src={post.author.image || '/assets/user.png'}
                    alt={post.author.username}
                    width={40}
                    height={40}
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <Link
                      href={`/user/${post.author.username}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <strong>@{post.author.username}</strong>
                    </Link>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                {(session?.user?.name === post.author.username || isOwner) && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(post.id)}
                    title="Delete post"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="post-content">{post.content}</div>
            </div>
          ))
        ) : (
          <div className="no-posts">
            <p>
              No posts yet.{' '}
              {session && canComment()
                ? 'Be the first to leave a comment!'
                : 'Login to leave a comment!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

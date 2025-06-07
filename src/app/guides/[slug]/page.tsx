'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { markdownToSafeHtml } from '@/lib/markdownUtils';

interface Guide {
  id: string;
  title: string;
  description: string;
  content: string;
  slug: string;
  tags: string[];
  image: string | null;
  links: { name: string; url: string }[];
  backgroundType: 'image' | 'gradient';
  gradientStart: string | null;
  gradientEnd: string | null;
  views: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string | null;
    image: string | null;
  };
}

export default function GuidePage() {
  const params = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuide() {
      try {
        const response = await fetch(`/api/guides/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setGuide(data);
        }
      } catch (error) {
        console.error('Error fetching guide:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchGuide();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          color: 'var(--secondary-color)',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!guide) {
    notFound();
  }

  const backgroundStyle =
    guide.backgroundType === 'image' && guide.image
      ? {
          backgroundImage: `url(${guide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
      : {
          backgroundImage: `linear-gradient(135deg, ${guide.gradientStart || '#00b7ff'}, ${guide.gradientEnd || '#b3ffec'})`,
        };

  return (
    <div className="guide-page">
      <div className="guide-container">
        <div className="guide-header">
          <div className="guide-upper-header" style={backgroundStyle}>
            {/* Background handled by style */}
          </div>

          <div className="guide-lower-header">
            <h1>{guide.title}</h1>
            <p className="guide-description">{guide.description}</p>

            <div className="guide-meta">
              {' '}
              <div className="meta-item">
                <span className="meta-icon">👤</span>
                <span>{guide.author.username || 'Anonymous'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">👁️</span>
                <span>{guide.views} views</span>
              </div>
            </div>

            <div className="guide-tags">
              {guide.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            {guide.links.length > 0 && (
              <div className="guide-links">
                <h3>Helpful Links</h3>
                <div className="links-grid">
                  {guide.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="guide-link"
                    >
                      <span className="link-name">{link.name}</span>
                      <span className="link-icon">🔗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="guide-content">
          <div
            className="markdown-content guide-markdown"
            dangerouslySetInnerHTML={{ __html: markdownToSafeHtml(guide.content) }}
          />
        </div>
      </div>

      <style jsx>{`
        .guide-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }

        .guide-container {
          background: var(--tertiary-color);
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .guide-header {
          margin-bottom: 20px;
        }

        .guide-upper-header {
          height: 200px;
          width: 100%;
        }

        .guide-lower-header {
          padding: 30px 50px;
          background: var(--tertiary-color);
        }

        .guide-lower-header h1 {
          color: var(--secondary-color);
          margin-bottom: 15px;
          font-size: 2.5rem;
          font-weight: bold;
        }

        .guide-description {
          color: var(--secondary-color);
          font-size: 1.2rem;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .guide-meta {
          display: flex;
          gap: 30px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #888;
          font-size: 0.95rem;
        }

        .meta-icon {
          font-size: 1.1rem;
        }

        .guide-tags {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 25px;
        }

        .tag {
          background: var(--background-color);
          color: var(--secondary-color);
          padding: 6px 14px;
          border-radius: 15px;
          font-size: 0.9rem;
          border: 1px solid #444;
        }

        .guide-links {
          margin-top: 20px;
        }

        .guide-links h3 {
          color: var(--secondary-color);
          margin-bottom: 15px;
          font-size: 1.3rem;
        }

        .links-grid {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .guide-link {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--background-color);
          color: var(--secondary-color);
          padding: 10px 16px;
          border-radius: 20px;
          text-decoration: none;
          border: 1px solid #444;
          transition: all 0.3s ease;
        }

        .guide-link:hover {
          background: #444;
          transform: translateY(-2px);
        }

        .link-name {
          font-weight: 500;
        }

        .link-icon {
          opacity: 0.7;
        }

        .guide-content {
          padding: 30px 50px;
          background: var(--tertiary-color);
          border-top: 2px solid var(--background-color);
        }

        .guide-markdown {
          color: var(--secondary-color);
          line-height: 1.8;
        }

        .guide-markdown h1 {
          color: var(--secondary-color);
          font-size: 2rem;
          margin: 30px 0 15px 0;
          border-bottom: 2px solid var(--background-color);
          padding-bottom: 10px;
        }

        .guide-markdown h2 {
          color: var(--secondary-color);
          font-size: 1.6rem;
          margin: 25px 0 12px 0;
          position: relative;
        }

        .guide-markdown h2::before {
          content: '📝';
          margin-right: 10px;
        }

        .guide-markdown h3 {
          color: var(--secondary-color);
          font-size: 1.3rem;
          margin: 20px 0 10px 0;
        }

        .guide-markdown p {
          margin-bottom: 16px;
        }

        .guide-markdown pre {
          background: var(--background-color);
          padding: 20px;
          border-radius: 10px;
          overflow-x: auto;
          margin: 20px 0;
          border: 1px solid #444;
          position: relative;
        }

        .guide-markdown pre::before {
          content: '💻 Code';
          position: absolute;
          top: -12px;
          left: 15px;
          background: var(--tertiary-color);
          padding: 2px 8px;
          font-size: 0.8rem;
          color: #888;
          border-radius: 4px;
        }

        .guide-markdown code {
          background: var(--background-color);
          padding: 3px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          border: 1px solid #444;
        }

        .guide-markdown pre code {
          background: none;
          padding: 0;
          border: none;
        }

        .guide-markdown ul {
          margin: 15px 0;
          padding-left: 25px;
        }

        .guide-markdown li {
          margin-bottom: 8px;
          position: relative;
        }

        .guide-markdown li::marker {
          content: '▸ ';
          color: var(--accent-color);
        }

        .guide-markdown strong {
          font-weight: bold;
          color: var(--secondary-color);
        }

        .guide-markdown em {
          font-style: italic;
        }

        @media (max-width: 768px) {
          .guide-page {
            padding: 10px;
          }

          .guide-lower-header,
          .guide-content {
            padding: 20px 25px;
          }

          .guide-lower-header h1 {
            font-size: 2rem;
          }

          .guide-meta {
            gap: 15px;
          }

          .links-grid {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

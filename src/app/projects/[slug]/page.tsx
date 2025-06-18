'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { markdownToSafeHtml } from '@/lib/markdownUtils';
import './project.css';

interface Project {
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
  stars: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string | null;
    image: string | null;
  };
}

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [isStarring, setIsStarring] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
          setIsOwner(data.isOwner);
          setIsStarred(data.isStarred || false);
          setStarCount(data.stars || 0);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchProject();
    }
  }, [params.slug]);

  const handleStarToggle = async () => {
    if (isStarring) return;

    const previousStarred = isStarred;
    const previousCount = starCount;

    setIsStarred(!isStarred);
    setStarCount((prev) => (isStarred ? prev - 1 : prev + 1));
    setIsStarring(true);

    try {
      const response = await fetch(`/api/star/${params.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsStarred(data.starred);
        setStarCount(data.starCount || (data.starred ? previousCount + 1 : previousCount - 1));
      } else {
        setIsStarred(previousStarred);
        setStarCount(previousCount);

        if (response.status === 401) {
          alert('Please log in to star projects');
        } else {
          throw new Error('Failed to toggle star');
        }
      }
    } catch (error) {
      setIsStarred(previousStarred);
      setStarCount(previousCount);
      console.error('Error toggling star:', error);
      alert('Failed to star project. Please try again.');
    } finally {
      setIsStarring(false);
    }
  };

  if (loading) {
    return (
      <div id="project-container">
        <div id="project-cont2">
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--secondary-color)',
            }}
          >
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  const backgroundStyle =
    project.backgroundType === 'image' && project.image
      ? {
          backgroundImage: `url(${project.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
      : {
          backgroundImage: `linear-gradient(90deg, ${project.gradientStart || 'var(--main-color)'}, ${project.gradientEnd || 'var(--secondary-color)'})`,
        };

  return (
    <div id="project-container">
      <Link
        href="/projects"
        id="back-to-projects"
        style={{ textDecoration: 'none', color: 'var(--main-color)', paddingBottom: '15px' }}
      >
        ← Back to Projects
      </Link>
      <div id="project-cont2">
        <div id="project-header">
          <div id="project-upper-header" style={backgroundStyle}></div>
          <div id="project-lower-header">
            <h1 id="project-title">{project.title}</h1>
            <p id="project-description">{project.description}</p>
            <div id="tags">
              {project.tags.map((tag, index) => (
                <p key={index}>{tag}</p>
              ))}
            </div>
            <hr id="project-overview-hr" />
            <div id="buttons-row">
              <button
                id="star-button"
                className={`project-button ${isStarred ? 'starred' : ''}`}
                onClick={handleStarToggle}
                disabled={isStarring}
              >
                <Image
                  src="/assets/roundedstar.png"
                  id="star-icon"
                  alt="Star"
                  width={20}
                  height={20}
                />
                {isStarred ? 'Starred' : 'Star'}
                <div id="star-count">{starCount}</div>
              </button>
              {isOwner && (
                <button id="edit-project-button" className="project-button">
                  <Image
                    src="/assets/pencil.png"
                    id="pencil-icon"
                    alt="Star"
                    width={20}
                    height={20}
                    style={{ verticalAlign: 'middle', marginRight: 4 }}
                  />
                  Edit Project
                </button>
              )}
              <button id="report-button" className="project-button">
                <Image
                  src="/assets/finish.png"
                  id="report-icon"
                  alt="Report"
                  width={20}
                  height={20}
                  style={{ verticalAlign: 'middle', marginRight: 4 }}
                />
                Report
              </button>
            </div>
          </div>
        </div>
        <hr className="horizontal" />
        <div id="project-contents">
          <div id="project-contents-left">
            <h2 style={{ marginTop: '0', marginBottom: '20px' }}>Description</h2>
            <hr style={{ minHeight: '2px', width: '75%', marginLeft: '0' }} />
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: markdownToSafeHtml(project.content) }}
            />
          </div>
          <hr />
          <div id="project-contents-right">
            <div id="project-contents-details">
              <h2>Details</h2>
              <p style={{ display: 'flex', alignItems: 'center' }}>
                <Link
                  href={`/user/${project.author.username || project.author.id}`}
                  style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  <Image
                    src={project.author.image || '/assets/default-avatar.png'}
                    alt={project.author.username || 'Unknown User'}
                    width={28}
                    height={28}
                    style={{ borderRadius: '50%', marginRight: '10px' }}
                  />
                  <span style={{ color: 'var(--main-color)' }}>
                    {project.author.username || 'Unknown User'}
                  </span>
                </Link>
              </p>

              <p>👁️ {project.views} views</p>
              <p>
                📅 Uploaded on {new Date(project.createdAt).toLocaleDateString()}
                <br />
                <span className="update-date">
                  (Updated {new Date(project.updatedAt).toLocaleDateString()})
                </span>
              </p>

              <div id="tags">
                {project.tags.map((tag, index) => (
                  <p key={index}>{tag}</p>
                ))}
              </div>
              <hr className="details-hr" />
              {project.links.length > 0 && (
                <>
                  <h3 style={{ marginTop: '0', marginBottom: '10px' }}>Links</h3>
                  {project.links.map((link, index) => (
                    <p key={index}>
                      <span>🔗 </span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.name}
                      </a>
                    </p>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

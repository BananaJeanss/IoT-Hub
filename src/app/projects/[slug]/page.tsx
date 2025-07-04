'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { markdownToSafeHtml } from '@/lib/markdownUtils';
import { useToast } from '@/components/ToastContext';
import './project.css';
import { Flag, Pencil, Star } from 'lucide-react';

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
  const { showToast } = useToast();
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
          showToast({
            message: 'You must be logged in to star projects.',
            type: 'error',
          });
        } else {
          throw new Error('Failed to toggle star');
        }
      }
    } catch (error) {
      setIsStarred(previousStarred);
      setStarCount(previousCount);
      console.error('Error toggling star:', error);
      showToast({
        message: 'Failed to toggle star. Please try again later.',
        type: 'error',
      });
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
            <hr className="projecthr" id="project-overview-hr" />
            <div id="buttons-row">
              <button
                id="star-button"
                className={`project-button ${isStarred ? 'starred' : ''}`}
                onClick={handleStarToggle}
                disabled={isStarring}
              >
                <Star size={20} id="star-icon" />
                {isStarred ? 'Starred' : 'Star'}
                <div id="star-count">{starCount}</div>
              </button>
              {isOwner && (
                <button id="edit-project-button" className="project-button">
                  <Pencil
                    size={20}
                    id="pencil-icon"
                    style={{ verticalAlign: 'middle', marginRight: 4 }}
                  />
                  Edit Project
                </button>
              )}
              <button id="report-button" className="project-button">
                <Flag
                  size={20}
                  id="report-icon"
                  style={{ verticalAlign: 'middle', marginRight: 4 }}
                />
                Report
              </button>
            </div>
          </div>
        </div>
        <hr className="horizontal projecthr" />
        <div id="project-contents">
          <div id="project-contents-left">
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: markdownToSafeHtml(project.content) }}
            />
          </div>
          <hr className="projecthr" />
          <div id="project-contents-right">
            <div id="project-contents-details">
              <h2>Details</h2>
              <p style={{ display: 'flex', alignItems: 'center' }}>
                <Link
                  href={`/user/${project.author.username || project.author.id}`}
                  style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  <Image
                    src={project.author.image || '/assets/user.png'}
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
              <hr className="projecthr details-hr" />
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

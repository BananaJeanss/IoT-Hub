'use client';

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
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
      <div id="project-cont2">
        <div id="project-header">
          <div id="project-upper-header" style={backgroundStyle}>
            {/* Background handled by style */}
          </div>
          <div id="project-lower-header">
            <h1>{project.title}</h1>
            <p>{project.description}</p>
            <div id="tags">
              {project.tags.map((tag, index) => (
                <p key={index}>{tag}</p>
              ))}
            </div>
          </div>
        </div>
        <hr className="horizontal" />
        <div id="project-contents">
          <div id="project-contents-left">
            <h2>Description</h2>
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: markdownToSafeHtml(project.content) }}
            />
          </div>
          <hr />
          <div id="project-contents-right">
            <div id="project-contents-details">
              <h2>Details</h2>
              <p>👤 {project.author.username || 'Anonymous'}</p>
              <p>👁️ {project.views} views</p>
              <p>
                📅 Uploaded on {new Date(project.createdAt).toLocaleDateString()}
                <br />
                (Updated {new Date(project.updatedAt).toLocaleDateString()})
              </p>
              <div id="tags">
                {project.tags.map((tag, index) => (
                  <p key={index}>{tag}</p>
                ))}
              </div>
              {project.links.length > 0 && (
                <>
                  <h3>Links</h3>
                  {project.links.map((link, index) => (
                    <p key={index}>
                      <span id="github-logo-link"></span>
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

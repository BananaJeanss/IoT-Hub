'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ContentCard from '@/components/ContentCard';

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  tags: string[];
  image: string | null;
  backgroundType: 'image' | 'gradient';
  gradientStart: string | null;
  gradientEnd: string | null;
  views: number;
  stars: number;
  createdAt: string;
  author: {
    username: string | null;
    image: string | null;
  };
}

export default function ProjectsPage() {
  const [latestProjects, setLatestProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch latest projects from API
    async function fetchLatestProjects() {
      try {
        const response = await fetch('/api/projects?limit=5&sort=latest');
        if (response.ok) {
          const data = await response.json();
          setLatestProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Error fetching latest projects:', error);
      }
    }

    fetchLatestProjects();
  }, []);

  return (
    <div id="main">
      <div id="hero">
        <div id="hero-container">
          <div id="left-half">
            <Image src="/assets/logow.png" height={150} width={150} alt="IoT Hub Logo" />
          </div>
          <div id="right-half">
            <div className="glow-bg purple"></div>
            <h1>IoT Projects</h1>
            <p>Discover amazing projects, learn new skills and share your own creations.</p>
          </div>
        </div>
      </div>
      <div id="content">
        <div className="content-container">
          <div id="content-class">
            <h2 style={{ marginTop: '60px' }}>🕒 Latest Projects</h2>
            <div id="latest-card-container">
              {latestProjects.slice(0, 5).map((project) => (
                <ContentCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  image={project.image}
                  slug={project.slug}
                  type="project"
                  views={project.views}
                  stars={project.stars}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

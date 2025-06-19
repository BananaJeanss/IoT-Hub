'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ProjectOrGuide {
  id: string;
  title: string;
  description: string;
  slug: string;
  image: string | null;
  views: number;
  stars: number;
  type: 'project' | 'guide';
}

export default function HomePage() {
  const [recentItems, setRecentItems] = useState<ProjectOrGuide[]>([]);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const [projectsRes, guidesRes] = await Promise.all([
          fetch('/api/projects?limit=5&sort=latest'),
          fetch('/api/guides?limit=5&sort=latest'),
        ]);
        const projectsData = projectsRes.ok ? await projectsRes.json() : { projects: [] };
        const guidesData = guidesRes.ok ? await guidesRes.json() : { guides: [] };

        const projects = (projectsData.projects || []).map((p: ProjectOrGuide) => ({
          ...p,
          type: 'project' as const,
        }));
        const guides = (guidesData.guides || []).map((g: ProjectOrGuide) => ({
          ...g,
          type: 'guide' as const,
        }));

        // Merge and sort by createdAt descending (most recent first)
        const merged = [...projects, ...guides].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setRecentItems(merged.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent items:', error);
        setRecentItems([]);
      }
    }
    fetchRecent();
  }, []);

  return (
    <div id="main">
      <div id="hero">
        <div id="hero-container">
          <div id="left-half">
            <Image src="/assets/logow.png" height={150} width={150} alt="IoT Hub Logo" />
          </div>
          <div id="right-half">
            <div className="glow-bg"></div>
            <h1>IoT Hub</h1>
            <p>Discover projects, learn new skills and share your own projects.</p>
          </div>
        </div>
      </div>
      <div id="content">
        <div className="content-container">
          <div id="content-class">
            <h2>🕒 Recent Posts</h2>
            <div id="card-container">
              {recentItems.map((item) => (
                <div className="content-card" key={item.type + '-' + item.id}>
                  <Image
                    src={item.image || '/assets/logow.png'}
                    alt={item.title}
                    width={1024}
                    height={1024}
                    style={{ width: '100%', height: 160, objectFit: 'cover' }}
                  />
                  <a href={`/${item.type === 'project' ? 'projects' : 'guides'}/${item.slug}`}>
                    <h3>
                      {item.title}
                      <span style={{ fontSize: 14, marginLeft: 8, color: '#888' }}>
                        {item.type === 'guide' ? '📚' : '🔧'}
                      </span>
                    </h3>
                  </a>
                  <p>{item.description}</p>
                  <div id="stats">
                    <p>⭐ {item.stars || 0}</p>
                    <p>👁️ {item.views}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

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

    // Featured projects (static for now)
    const projects = [
      {
        title: 'Smart Home Automation',
        img: '/assets/logow.png',
        desc: 'Control your entire home with IoT sensors and automation.',
        link: '/projects/smart-home',
      },
      {
        title: 'Weather Monitoring Station',
        img: '/assets/logow.png',
        desc: 'Track local weather conditions with real-time data.',
        link: '/projects/weather-station',
      },
      {
        title: 'Smart Garden System',
        img: '/assets/logow.png',
        desc: 'Automated plant care with soil and climate monitoring.',
        link: '/projects/smart-garden',
      },
      {
        title: 'IoT Security Camera',
        img: '/assets/logow.png',
        desc: 'Remote surveillance with motion detection and alerts.',
        link: '/projects/security-camera',
      },
      {
        title: 'Energy Monitor',
        img: '/assets/logow.png',
        desc: 'Track and optimize your household energy consumption.',
        link: '/projects/energy-monitor',
      },
    ];

    const getRandomProjects = (arr: typeof projects, n: number) => {
      const shuffled = arr.slice().sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const cardContainer = document.getElementById('card-container');
    if (cardContainer) {
      cardContainer.innerHTML = '';
      // Ensure exactly 5 featured projects
      const featuredProjects = getRandomProjects(projects, 5);
      featuredProjects.forEach((project) => {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.innerHTML = `
          <img src="${project.img}" alt="${project.title}" style="width: 100%; height: 160px; object-fit: cover;" />
          <a href="${project.link}">
            <h3>${project.title}</h3>
          </a>
          <p>${project.desc}</p>
          <div id="stats">
            <p>⭐ ${(Math.random() * 1.2 + 3.8).toFixed(1)}</p>
            <p>👁️ ${Math.floor(Math.random() * 200 + 50)}</p>
          </div>
        `;
        cardContainer.appendChild(card);
      });
    }
  }, []);

  // Effect to populate latest projects when data is available
  useEffect(() => {
    if (latestProjects.length > 0) {
      const latestContainer = document.getElementById('latest-card-container');
      if (latestContainer) {
        latestContainer.innerHTML = '';
        // Limit to exactly 5 latest projects
        const limitedProjects = latestProjects.slice(0, 5);
        limitedProjects.forEach((project) => {
          const card = document.createElement('div');
          card.className = 'content-card';
          const imageUrl = project.image || '/assets/logow.png';
          const rating = (Math.random() * 1.2 + 3.8).toFixed(1);

          card.innerHTML = `
            <img src="${imageUrl}" alt="${project.title}" style="width: 100%; height: 160px; object-fit: cover;" />
            <a href="/projects/${project.slug}">
              <h3>${project.title}</h3>
            </a>
            <p>${project.description}</p>
            <div id="stats">
              <p>⭐ ${rating}</p>
              <p>👁️ ${project.views}</p>
            </div>
          `;
          latestContainer.appendChild(card);
        });
      }
    }
  }, [latestProjects]);

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
            <h2>⭐ Featured</h2>
            <div id="card-container"></div>

            <h2 style={{ marginTop: '60px' }}>🕒 Latest Projects</h2>
            <div id="latest-card-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

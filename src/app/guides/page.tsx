'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ContentCard from '@/components/ContentCard';

interface Guide {
  id: string;
  title: string;
  description: string;
  slug: string;
  image: string | null;
  views: number;
  stars: number;
  createdAt: string;
  author: {
    username: string | null;
  };
}

export default function GuidesPage() {
  const [latestGuides, setLatestGuides] = useState<Guide[]>([]);

  useEffect(() => {
    async function fetchLatestGuides() {
      try {
        const response = await fetch('/api/guides?limit=5&sort=latest');
        if (response.ok) {
          const data = await response.json();
          setLatestGuides(data.guides || []);
        }
      } catch (error) {
        console.error('Error fetching latest guides:', error);
      }
    }
    fetchLatestGuides();
  }, []);

  return (
    <div id="main">
      <div id="hero">
        <div id="hero-container">
          <div id="left-half">
            <Image src="/assets/logow.png" height={150} width={150} alt="IoT Hub Logo" />
          </div>
          <div id="right-half">
            <div className="glow-bg yellow"></div>
            <h1>IoT Guides</h1>
            <p>Discover tutorials, learn new skills and share your knowledge.</p>
          </div>
        </div>
      </div>
      <div id="content">
        <div className="content-container">
          <div id="content-class">
            <h2>🕒 Latest Guides</h2>
            <div id="latest-card-container">
              {latestGuides.length === 0 && <p>No guides found.</p>}
              {latestGuides.map((guide) => (
                <ContentCard
                  key={guide.id}
                  id={guide.id}
                  title={guide.title}
                  description={guide.description}
                  image={guide.image || null}
                  slug={guide.slug}
                  type="guide"
                  views={guide.views}
                  stars={guide.stars}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

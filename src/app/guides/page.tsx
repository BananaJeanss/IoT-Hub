'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Guide {
  id: string;
  title: string;
  description: string;
  slug: string;
  image: string | null;
  views: number;
  createdAt: string;
  author: {
    username: string | null;
  };
}

export default function GuidesPage() {
  const [latestGuides, setLatestGuides] = useState<Guide[]>([]);

  useEffect(() => {
    // Fetch latest guides from API
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

    // Featured guides (static for now)
    const guides = [
      {
        title: 'Arduino Basics Guide',
        img: '/assets/logow.png',
        desc: 'Learn the fundamentals of Arduino programming and hardware.',
        link: '/guides/arduino-basics',
      },
      {
        title: 'IoT Sensor Networks',
        img: '/assets/logow.png',
        desc: 'Build scalable sensor networks for IoT applications.',
        link: '/guides/sensor-networks',
      },
      {
        title: 'MQTT Protocol Tutorial',
        img: '/assets/logow.png',
        desc: 'Master MQTT for efficient IoT communication.',
        link: '/guides/mqtt-tutorial',
      },
      {
        title: 'ESP32 Deep Dive',
        img: '/assets/logow.png',
        desc: 'Explore advanced ESP32 features and capabilities.',
        link: '/guides/esp32-guide',
      },
      {
        title: 'IoT Security Best Practices',
        img: '/assets/logow.png',
        desc: 'Secure your IoT devices and networks effectively.',
        link: '/guides/iot-security',
      },
    ];

    const getRandomGuides = (arr: typeof guides, n: number) => {
      const shuffled = arr.slice().sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const cardContainer = document.getElementById('card-container');
    if (cardContainer) {
      cardContainer.innerHTML = '';
      getRandomGuides(guides, 5).forEach((guide) => {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.innerHTML = `
          <Image src="${guide.img}" alt="${guide.title}" width="150" height="150" />
          <a href="${guide.link}">
            <h3>${guide.title}</h3>
          </a>
          <p>${guide.desc}</p>
          <div id="stats">
            <p>⭐ ${(Math.random() * 1.2 + 3.8).toFixed(1)}</p>
            <p>👁️ ${Math.floor(Math.random() * 200 + 50)}</p>
          </div>
        `;
        cardContainer.appendChild(card);
      });
    }
  }, []);

  // Effect to populate latest guides when data is available
  useEffect(() => {
    if (latestGuides.length > 0) {
      const latestContainer = document.getElementById('latest-card-container');
      if (latestContainer) {
        latestContainer.innerHTML = '';
        latestGuides.forEach((guide) => {
          const card = document.createElement('div');
          card.className = 'content-card';
          const imageUrl = guide.image || '/assets/logow.png';
          const rating = (Math.random() * 1.2 + 3.8).toFixed(1);

          card.innerHTML = `
            <img src="${imageUrl}" alt="${guide.title}" style="width: 100%; height: 160px; object-fit: cover;" />
            <a href="/guides/${guide.slug}">
              <h3>${guide.title}</h3>
            </a>
            <p>${guide.description}</p>
            <div id="stats">
              <p>⭐ ${rating}</p>
              <p>👁️ ${guide.views}</p>
            </div>
          `;
          latestContainer.appendChild(card);
        });
      }
    }
  }, [latestGuides]);

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
            <h2>⭐ Featured</h2>
            <div id="card-container"></div>

            <h2 style={{ marginTop: '60px' }}>🕒 Latest Guides</h2>
            <div id="latest-card-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

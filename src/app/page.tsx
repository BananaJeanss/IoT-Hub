// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import Image from 'next/image'; // Add this import

export default function HomePage() {
  useEffect(() => {
    const projects = [
      {
        title: 'Smart Garden Monitor',
        img: '/assets/logow.png',
        desc: 'Monitor your plants remotely with real-time data and alerts.',
        link: '/project',
      },
      {
        title: 'IoT Weather Station',
        img: '/assets/logow.png',
        desc: 'Track local weather conditions and visualize trends.',
        link: '/project',
      },
      {
        title: 'Connected Door Lock',
        img: '/assets/logow.png',
        desc: 'Secure your home with a smart, app-controlled door lock.',
        link: '/project',
      },
      {
        title: 'Energy Usage Tracker',
        img: '/assets/logow.png',
        desc: 'Analyze and optimize your household energy consumption.',
        link: '/project',
      },
      {
        title: 'Remote Pet Feeder',
        img: '/assets/logow.png',
        desc: 'Feed your pets from anywhere using your smartphone.',
        link: '/project',
      },
    ];

    const getRandomProjects = (arr: typeof projects, n: number) => {
      const shuffled = arr.slice().sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const cardContainer = document.getElementById('card-container');
    if (cardContainer) {
      cardContainer.innerHTML = '';
      getRandomProjects(projects, 5).forEach((project) => {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.innerHTML = `
          <Image src="${project.img}" alt="${project.title}" width="150" height="150" />
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
            <h2>⭐ Featured</h2>
            <div id="card-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

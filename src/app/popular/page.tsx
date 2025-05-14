// src/app/popular/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';

export default function PopularPage() {
  return (
      <div id="hero">
        <div id="hero-container">
            <div id="left-half">
            <Image src="/assets/logow.png" height={150} width={150} alt="IoT Hub Logo" />
            </div>
          <div id="right-half">
            <div className="glow-bg purple"></div>
            <h1>Popular</h1>
            <p>Currently trending IoT projects and guides.</p>
          </div>
        </div>
      </div>
  );
}
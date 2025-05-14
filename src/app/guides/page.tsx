'use client';

import React from 'react';
import Image from 'next/image';

export default function GuidesPage() {
  return (
    <div id="main">
      <div id="hero">
        <div id="hero-container">
            <div id="left-half">
            <Image src="/assets/logow.png" height={150} width={150} alt="IoT Hub Logo" />
            </div>
          <div id="right-half">
            <div className="glow-bg yellow"></div>
            <h1>Guides</h1>
            <p>Explore our collection of guides to help you get started with IoT projects.</p>
          </div>
        </div>
      </div>
      <div>
        <div className="content-container">
          <div id="content-class">
            <h2>📚 Guides</h2>
            <div id="card-container">
                <div className="content-card">
                <Image src="/assets/logow.png" alt="Guide 1" width={150} height={150} />
                <a href="">
                  <h3>Getting Started with IoT</h3>
                </a>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec lacinia velit. Praesent nec
                  ligula neque. Suspendisse semper nunc quis tristique convallis. Vivamus sed sem quis ipsum
                  ullamcorper tincidunt eget quis sapien.
                </p>
                <div id="stats">
                  <p>⭐ 4.8</p>
                  <p>👁️ 120</p>
                </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
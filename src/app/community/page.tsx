'use client';

import React from 'react';
import Image from 'next/image';

export default function CommunityPage() {
  return (
    <div id="main">
        <div id="hero">
            <div id="hero-container">
                <div id="left-half">
                    <Image src="/assets/logow.png" height={150} width={150} alt="" />
                </div>
                <div id="right-half">
                    <div className="glow-bg green"></div>
                    <h1>Community</h1>
                    <p>Share your ideas, discuss projects, and more with the community.</p>
                </div>
            </div>
        </div>
    </div>
    );
}
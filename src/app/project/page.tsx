'use client';

import React from 'react';
import './project.css';

export default function ProjectPage() {
  return (
    <div id="project-container">
      <div id="project-header">
        <div id="project-upper-header">
            {/* Show an image if available, otherwise nothing */}
            {/* Replace 'imageUrl' with your actual image variable if needed */}
            {/* Example: const imageUrl = null; */}
            {/* {imageUrl && <img src={imageUrl} alt="Project" />} */}
        </div>
        <div id="project-lower-header">
          <h1>Project Name</h1>
          <p>
            Project description goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec
            lacinia velit. Praesent nec ligula neque. Suspendisse semper nunc quis tristique convallis.
            Vivamus sed sem quis ipsum ullamcorper tincidunt eget quis sapien.
          </p>
          <div id="tags">
            <p>🤖 AI</p>
            <p>🧠 ML</p>
            <p>🌐 Web</p>
            <p>📱 Mobile</p>
          </div>
        </div>
      </div>
      <div id="project-header-seperator"></div>
      <div id="project-contents">
        <div id="project-contents-left">
          <h2>Description</h2>
          <p>
            readme.md yadayada images and stuff wow wow wow lorem ipsum wooooooow dolor sit amet, consectetur
            adipiscing elit. In nec lacinia velit. Praesent nec ligula neque. Suspendisse semper nunc quis
            tristique convallis. Vivamus sed sem quis ipsum ullamcorper tincidunt eget quis sapien.
            <br />
            <br />
            br
            {/* You can add images here as needed */}
          </p>
        </div>
        <div id="project-content-seperator"></div>
        <div id="project-contents-right">
          <div id="project-contents-details">
            <h2>Details</h2>
            <p>👤 Author Name</p>
            <p>⭐ 4.8/5 rating</p>
            <p>👁️ 120 views</p>
            <p>
              📅 Uploaded on 2023-10-01
              <br />
              (Updated 5 hours ago)
            </p>
            <div id="tags">
              <p>🤖 AI</p>
              <p>🧠 ML</p>
              <p>🌐 Web</p>
              <p>📱 Mobile</p>
            </div>
            <h3>Links</h3>
            <p>
              <span id="github-logo-link"></span>
              <a href="https://github.com/BananaJeanss/IoT-Hub"> BananaJeanss/IoT-Hub</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
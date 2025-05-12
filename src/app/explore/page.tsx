"use client";

import React from "react";

import "./explore.css";

export default function CommunityPage() {
  return (
    <div id="main">
      <div id="hero">
        <div id="hero-container">
          <div id="left-half">
            <img src="../assets/logow.png" height="150px" alt=""></img>
          </div>
          <div id="right-half">
            <div className="glow-bg cyan"></div>
            <h1>Explore</h1>
            <p>
              Explore recently uploaded, highest rated, or upcoming projects.{" "}
            </p>
          </div>
        </div>
      </div>

      <div id="explore">
        <div id="explore-top">
          <div id="explore-top-left">
            <h2>🔍 Explore</h2>
          </div>
          <div id="explore-top-right">
            <div className="dropdown">
              <select defaultValue="">
                <option value="" disabled>
                  Sort by (default)
                </option>
                <option value="recent">Recently Uploaded</option>
                <option value="rating">Highest Rated</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>
        </div>
        <div id="explore-list">
          <div className="explore-card">
            <img src="../assets/logow.png" alt="Project 1"></img>
            <a href="">
              <h3>Project 1</h3>
            </a>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec
              lacinia velit. Praesent nec ligula neque. Suspendisse semper nunc
              quis tristique convallis. Vivamus sed sem quis ipsum ullamcorper
              tincidunt eget quis sapien.
            </p>
            <div id="stats">
              <div id="stats-left">
                <p>⭐ 4.8</p>
                <p>👁️ 120</p>
              </div>
              <div id="stats-right">
                <p id="stats-username">
                  <img
                    id="stats-pfp"
                    src="../assets/user.png"
                    alt="User 1"
                  ></img>
                  <strong>Username</strong>
                </p>
                <p id="stats-date">
                  🗓️ Created on 5/10/2025 (Updated 5 hours ago)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

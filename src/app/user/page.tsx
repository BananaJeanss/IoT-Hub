'use client';

import React from 'react';

import './user.css'

export default function UserPage() {
  return (
  <div id="main">
    <div id="profile">
      <div id="profile-container">
        <div id="left-half">
          <div id="pfp-info-container">
            <div id="pfp">
              <img src="../assets/user.png" alt="Profile Picture"></img>
            </div>
            <div id="info">
              <h2>Username</h2>
              <p>Lorem ipsum dolor sit amet, the bio would go here.</p>
              <div id="interest-tags">
                <span className="tag">🤖 IoT</span>
                <span className="tag">🤖 SmartHome</span>
                <span className="tag">🤖 Automation</span>
              </div>
            </div>
          </div>

          <div id="profile-projects-container">
            <h2>Projects & Guides</h2>
            <div id="profile-projects">
              <div className="profile-projects-list">
                <h3>📌 Pinned</h3>
                <div id="cards-list">
                      {[
                        { title: "Smart Home Automation", img: "../assets/logow.png", desc: "Lorem ipsum dolor sit amet…" },
                        { title: "Weather Station", img: "../assets/logow.png", desc: "Lorem ipsum dolor sit amet…" },
                        { title: "Smart Garden", img: "../assets/logow.png", desc: "Lorem ipsum dolor sit amet…" }
                      ].map((project, idx) => (
                        <div className="profile-project-card" key={idx}>
                          <img src={project.img} alt={project.title} />
                          <a href=""><h3>{project.title}</h3></a>
                          <p>{project.desc}</p>
                          <div className="stats">
                            <p>⭐ 4.8</p>
                            <p>👁️ 120</p>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="right-half">
          <div id="activity-container">
            <h2>Activity</h2>
            <div id="activity">
              <div className="activity-card">
                <p>Username liked a <a id="activity-link" href="">project</a></p>
                <p>Username left a comment on <a id="activity-link" href="">project</a></p>
                <p>Username favorited <a id="activity-link" href="">project</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
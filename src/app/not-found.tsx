import React from 'react';

import './not-found.css'

export default function NotFound() {
  return (
    <>
      <title>404 - IoT Hub</title>
      <link rel="stylesheet" href="/404.css" />
      <div id="foohfo">
        <h1>404</h1>
        <p>Oops! The page you are looking for does not exist.</p>
        <a href="/" className="button">Go to Home</a>
      </div>
    </>
  );
}
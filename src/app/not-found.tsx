'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

import './not-found.css';

export default function NotFound() {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const textArray = useMemo(() => ['404', 'four-zero-four', 'not found', 'error'], []);

  useEffect(() => {
    const handleType = () => {
      const currentIndex = loopNum % textArray.length;
      const fullText = textArray[currentIndex];

      setDisplayText(
        isDeleting
          ? fullText.substring(0, displayText.length - 1)
          : fullText.substring(0, displayText.length + 1),
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && displayText === fullText) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, typingSpeed, textArray]);

  return (
    <>
      <title>404 - IoT Hub</title>
      <div id="foohfo">
        <h1>
          {displayText}
          <span className="cursor">|</span>
        </h1>
        <p>Oops! The page you are looking for does not exist.</p>
        <Link href="/">Go back home</Link>
      </div>
    </>
  );
}

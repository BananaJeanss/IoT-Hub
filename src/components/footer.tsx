'use client';

import Image from 'next/image';

import './footer.css';

export default function Footer() {
  return (
    <footer>
      <ul>
        <li>
          <Image src="/assets/logow.png" alt="Logo" width={50} height={50} />
        </li>
        |
        <li>
          <span>&copy; {new Date().getFullYear()} BananaJeanss</span>
        </li>
        |
        <li>
          <span>
            <a href="https://github.com/BananaJeanss/iot-hub" target="_blank" rel="noopener">
              View Source Code on Github
            </a>
          </span>
        </li>
      </ul>
    </footer>
  );
}

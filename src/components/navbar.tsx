"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [navActive, setNavActive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session} = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setNavActive((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className={`navbar-container${navActive ? ' active' : ''}`}>
      <div id="left-nav">
        <Link href="/">
          <Image src="/assets/logow.png" alt="Logo" width={64} height={64} />
        </Link>
        <Link href="/explore">Explore</Link>
        <Link href="/guides">Guides</Link>
        <Link href="/popular">Popular</Link>
        <Link href="/community">Community</Link>
      </div>
      <button
        id="navbar-toggle"
        aria-label="Toggle navigation"
        aria-expanded={navActive}
        onClick={handleToggle}
      >
        &#9776;
      </button>
      <div id="right-nav">
        {session?.user ? (
          <div id="navbar-userinfo" ref={dropdownRef}>
            <Image
              id="nav-pfp"
              src={session.user.image || "/assets/user.png"}
              alt="Profile Picture"
              width={32}
              height={32}
            />
            <span id="username">
              <Link href="/user/">
                <strong>@{session.user.name || "User"}</strong>
              </Link>
            </span>
            <div className="navbar-dropdown">
              <button
                className="dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((prev: boolean) => !prev);
                }}
              >
                <Image src="/assets/arrow.png" alt="Menu" width={16} height={16} />
              </button>
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <button><Link href="/user">Your Profile</Link></button>
                    <button><Link href="/settings">Settings</Link></button>
                    <button onClick={() => signOut()}>Logout</button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        ) : ( // User not logged in
          <>
            <Link href="/login">Login</Link>
            <Link href="/login#signup">Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}
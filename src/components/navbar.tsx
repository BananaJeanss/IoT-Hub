import Link from 'next/link';
import Image from 'next/image';


export default function Navbar() {
  return (
    <div className="navbar-container">
      <div id="left-nav">
        <Link href="/">
          <Image src="/assets/logow.png" alt="Logo" width={64} height={64} />
        </Link>
        <Link href="/explore">Explore</Link>
        <Link href="/guides">Guides</Link>
        <Link href="/popular">Popular</Link>
        <Link href="/community">Community</Link>
      </div>
      <button id="navbar-toggle" aria-label="Toggle navigation">&#9776;</button>
      <div id="right-nav">
        <div id="navbar-userinfo">
          <Image id="nav-pfp" src="/assets/user.png" alt="Profile Picture" width={32} height={32} />
          <span id="username">
            <Link href="/user/"><strong>Username</strong></Link>
          </span>
        </div>
        <Link href="/login">Login</Link>
        <Link href="/login#signup">Sign Up</Link>
      </div>
    </div>
  );
}
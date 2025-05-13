'use client';

import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';

import { useRouter } from 'next/navigation';

import './login.css';

export default function LoginPage() {
  const [form, setForm] = useState<'login' | 'signup'>('login');
  const router = useRouter();

  useEffect(() => {
    const handleHash = () => {
      setForm(window.location.hash === '#signup' ? 'signup' : 'login');
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents page reload

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm-password") as string;

    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    // Send signup data to your API
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      // Optionally, auto-login or redirect
      alert("Signup successful! You can now log in.");
      window.location.hash = "#login";
    } else {
      const data = await res.json();
      alert(data.error || "Signup failed.");
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents page reload

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Send login data to your API
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res && res.ok) {
      router.push("/"); // Redirect to home page on successful login
    }
    else {
      alert("Login failed. Please check your credentials.");
    }
  }

  return (
    <div id="main">
      <div id="login">
        <div className="auth-container">
          <div
            id="login-form"
            className="form-pane"
            style={{ display: form === 'login' ? 'block' : 'none' }}
          >
            <h1>Login to IoT Hub</h1>
            <div className="auth-inner">
              <div className="auth-left">
                <button className="google-button">
                  <img src="../assets/google.png" alt="Google Logo" />
                  <span>Login with Google</span>
                </button>
                <button className="github-button">
                  <img src="../assets/github.png" alt="GitHub Logo" />
                  <span>Login with GitHub</span>
                </button>
                <p style={{ textAlign: 'center', fontSize: 25, color: 'white' }}>
                  <strong>or</strong>
                </p>
                <form onSubmit={handleLogin}>
                  <label htmlFor="login-username">Username:</label>
                  <input 
                  type="text" 
                  id="login-username" 
                  name="username" 
                  required
                  autoComplete='username' />
                  <label htmlFor="login-password">Password:</label>
                  <input type="password"
                   id="login-password" 
                   name="password" 
                   required
                   autoComplete='current-password' />
                  <button type="submit">Login</button>
                </form>
                <p>
                  Don&apos;t have an account?{' '}
                  <a
                    href="#signup"
                    onClick={e => {
                      e.preventDefault();
                      window.location.hash = '#signup';
                    }}
                  >
                    Sign Up
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div
            id="signup-form"
            className="form-pane"
            style={{ display: form === 'signup' ? 'block' : 'none' }}
          >
            <h1>Create an Account</h1>
            <div className="auth-inner">
              <div className="auth-left">
                <button className="google-button">
                  <img src="../assets/google.png" alt="Google Logo" />
                  <span>Sign up with Google</span>
                </button>
                <button className="github-button">
                  <img src="../assets/github.png" alt="GitHub Logo" />
                  <span>Sign up with GitHub</span>
                </button>
                <p style={{ textAlign: 'center', fontSize: 25, color: 'white' }}>
                  <strong>or</strong>
                </p>
                <form onSubmit={handleSignup}>
                <label htmlFor="signup-username">Username:</label>
                <input
                  type="text"
                  id="signup-username"
                  name="username"
                  required
                  autoComplete="username"
                />
                <label htmlFor="signup-email">Email:</label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  required
                  autoComplete="email"
                />
                <label htmlFor="signup-password">Password:</label>
                <input
                  type="password"
                  id="signup-password"
                  name="password"
                  required
                  autoComplete="new-password"
                />
                <label htmlFor="signup-confirm">Confirm Password:</label>
                <input
                  type="password"
                  id="signup-confirm"
                  name="confirm-password"
                  required
                  autoComplete="new-password"
                />
                  <button type="submit">Sign Up</button>
                </form>
                <p>
                  Already have an account?{' '}
                  <a
                    href="#login"
                    onClick={e => {
                      e.preventDefault();
                      window.location.hash = '#login';
                    }}
                  >
                    Log In
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
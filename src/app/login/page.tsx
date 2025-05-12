'use client';

import React, { useEffect, useState } from 'react';
import './login.css';

export default function LoginPage() {
  const [form, setForm] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const handleHash = () => {
      setForm(window.location.hash === '#signup' ? 'signup' : 'login');
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

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
                <form action="/login" method="POST">
                  <label htmlFor="login-username">Username:</label>
                  <input type="text" id="login-username" name="username" required />
                  <label htmlFor="login-password">Password:</label>
                  <input type="password" id="login-password" name="password" required />
                  <button type="submit">Login</button>
                </form>
                <p>
                  Don't have an account?{' '}
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
                <form action="/signup" method="POST">
                  <label htmlFor="signup-username">Username:</label>
                  <input type="text" id="signup-username" name="username" required />
                  <label htmlFor="signup-email">Email:</label>
                  <input type="email" id="signup-email" name="email" required />
                  <label htmlFor="signup-password">Password:</label>
                  <input type="password" id="signup-password" name="password" required />
                  <label htmlFor="signup-confirm">Confirm Password:</label>
                  <input type="password" id="signup-confirm" name="confirm-password" required />
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
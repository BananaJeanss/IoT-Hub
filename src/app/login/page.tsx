'use client';

import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import Image from 'next/image';
import { CircleAlert } from 'lucide-react';

import './login.css';

export default function LoginPage() {
  const [form, setForm] = useState<'login' | 'signup'>('login');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const [signupPassword, setSignupPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: 'Too weak', color: '#e74c3c' });

  function evaluatePasswordStrength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;

    if (score <= 1) return { score: 20, label: 'Too weak', color: '#e74c3c' };
    if (score === 2) return { score: 40, label: 'Weak', color: '#e67e22' };
    if (score === 3) return { score: 60, label: 'Medium', color: '#f1c40f' };
    if (score === 4) return { score: 80, label: 'Strong', color: '#27ae60' };
    return { score: 100, label: 'Very strong', color: '#2ecc71' };
  }

  useEffect(() => {
    const handleHash = () => {
      setForm(window.location.hash === '#signup' ? 'signup' : 'login');
      setShowEmailForm(false); // Reset email form visibility when switching tabs
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm-password') as string;

    if (password !== confirm) {
      showToast({
        message: 'Passwords do not match!',
        type: 'error',
      });
      return;
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      // Auto-login after successful signup
      const loginRes = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (loginRes && loginRes.ok) {
        showToast({
          message: 'Signup successful! You are now logged in.',
          type: 'success',
        });
        router.push('/');
      } else {
        showToast({
          message: 'Signup successful! Please log in.',
          type: 'success',
        });
        window.location.hash = '#login';
        setShowEmailForm(false);
      }
    } else {
      showToast({
        message: 'Signup failed. Please try again.',
        type: 'error',
      });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (res && res.ok) {
      showToast({
        message: 'Login successful!',
        type: 'success',
      });
      router.push('/');
    } else {
      showToast({
        message: 'Login failed. Please check your credentials.',
        type: 'error',
      });
    }
  };

  const passwordMatchCheck = () => {
    const passwordField = document.getElementById('signup-password') as HTMLInputElement;
    const confirmField = document.getElementById('signup-confirm') as HTMLInputElement;
    const passwordNotMatch = document.getElementById('password-not-match') as HTMLDivElement;

    // Only check if both fields have values
    if (!passwordField.value || !confirmField.value) {
      // Hide the mismatch message if either field is empty
      passwordNotMatch.className = 'password-mismatch hide';
      setTimeout(() => {
        if (passwordNotMatch.className.includes('hide')) {
          passwordNotMatch.style.display = 'none';
        }
      }, 300);
      return;
    }

    if (confirmField.value !== passwordField.value) {
      // Show with blob-in animation
      passwordNotMatch.style.display = 'flex';
      passwordNotMatch.className = 'password-mismatch';
    } else {
      // Hide with blob-out animation
      passwordNotMatch.className = 'password-mismatch hide';

      // Hide element after animation completes
      setTimeout(() => {
        if (passwordNotMatch.className.includes('hide')) {
          passwordNotMatch.style.display = 'none';
        }
      }, 300); // Match animation duration
    }
  };

  return (
    <div id="main">
      <div id="login">
        <div className="auth-container">
          <div
            id="login-form"
            className="form-pane"
            style={{ display: form === 'login' ? 'block' : 'none' }}
          >
            {showEmailForm && (
              <button className="back-button" onClick={() => setShowEmailForm(false)}>
                ← Back to all sign in options
              </button>
            )}
            <h1 className="loginh1">Login to IoT Hub</h1>
            <div className="auth-inner">
              <div className="auth-left">
                {!showEmailForm ? (
                  // Initial login view with three buttons
                  <>
                    <button className="email-button" onClick={() => setShowEmailForm(true)}>
                      <Image src="/assets/user.png" alt="Email Login" width={24} height={24} />
                      <span>Sign in with Email</span>
                    </button>
                    <button className="github-button" disabled>
                      <Image src="/assets/github.png" alt="GitHub Logo" width={24} height={24} />
                      <span>Sign in with GitHub</span>
                    </button>
                    <p>
                      Don&apos;t have an account?{' '}
                      <a
                        href="#signup"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.hash = '#signup';
                        }}
                      >
                        Sign Up
                      </a>
                    </p>
                  </>
                ) : (
                  // Email login form
                  <>
                    <form onSubmit={handleLogin}>
                      <label htmlFor="login-username">Username:</label>
                      <input
                        type="text"
                        id="login-username"
                        name="username"
                        required
                        autoComplete="username"
                      />
                      <label htmlFor="login-password">Password:</label>
                      <input
                        type="password"
                        id="login-password"
                        name="password"
                        required
                        autoComplete="current-password"
                      />
                      <button type="submit">Login</button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            id="signup-form"
            className="form-pane"
            style={{ display: form === 'signup' ? 'block' : 'none' }}
          >
            {showEmailForm && (
              <button className="back-button" onClick={() => setShowEmailForm(false)}>
                ← Back to all sign up options
              </button>
            )}
            <h1 className="loginh1">Create an Account</h1>
            <div className="auth-inner">
              <div className="auth-left">
                {!showEmailForm ? (
                  // Initial signup view with three buttons
                  <>
                    <button className="email-button" onClick={() => setShowEmailForm(true)}>
                      <Image src="/assets/user.png" alt="Email Signup" width={24} height={24} />
                      <span>Sign up with Email</span>
                    </button>
                    <button className="github-button" disabled>
                      <Image src="/assets/github.png" alt="GitHub Logo" width={24} height={24} />
                      <span>Sign up with GitHub</span>
                    </button>
                    <p>
                      Already have an account?{' '}
                      <a
                        href="#login"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.hash = '#login';
                        }}
                      >
                        Log In
                      </a>
                    </p>
                  </>
                ) : (
                  // Email signup form
                  <>
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
                        value={signupPassword}
                        onChange={(e) => {
                          setSignupPassword(e.target.value);
                          setPasswordStrength(evaluatePasswordStrength(e.target.value));
                          setTimeout(passwordMatchCheck, 0);
                        }}
                      />
                      <div style={{ margin: '8px 0' }}>
                        <div
                          style={{
                            height: '8px',
                            width: '100%',
                            background: '#333',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            marginBottom: '4px',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${passwordStrength.score}%`,
                              background: passwordStrength.color,
                              transition: 'width 0.3s, background 0.3s',
                            }}
                          />
                        </div>
                        <span style={{ color: passwordStrength.color, fontWeight: 600 }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <label htmlFor="signup-confirm">Confirm Password:</label>
                      <input
                        type="password"
                        id="signup-confirm"
                        name="confirm-password"
                        required
                        autoComplete="new-password"
                        onChange={passwordMatchCheck}
                      />
                      <div
                        id="password-not-match"
                        className="password-mismatch"
                        style={{ display: 'none' }}
                      >
                        <CircleAlert size={16} />
                        Passwords do not match!
                      </div>
                      <button
                        type="submit"
                        disabled={
                          signupPassword.length === 0 || passwordStrength.score < 60 // Require at least "Medium" strength
                        }
                      >
                        Sign Up
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

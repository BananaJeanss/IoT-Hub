'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import './verify.css';

export default function VerifyPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token. \n Redirecting to homepage...');

      setTimeout(() => {
        router.push('/');
      }, 2500);
      return;
    }

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('success');
          setMessage('Your email has been verified! Redirecting you to the homepage...');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. Please try again later.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed. Please try again later.');
      });
  }, [router]);

  return (
    <div className="verify-page">
      <Image src="/assets/mail.png" alt="Verification Email" width={100} height={100} />
      <h1>Email Verification</h1>
      {status === 'verifying' && <p>Verifying your email...</p>}
      {status === 'success' && <p style={{ color: 'green' }}>{message}</p>}
      {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}

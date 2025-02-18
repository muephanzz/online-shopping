import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Sign in successful! Redirecting...');
      setTimeout(() => {
        setMessage('');
        router.push('/');
      }, 1500);
    }
  };

  return (
    <div className="pt-60 p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border p-2 w-full mb-4"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="border p-2 w-full mb-4"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Sign In
        </button>
      </form>
      <p className="mt-4 text-blue-500 cursor-pointer">
        <Link href="/forgot-password">Forgot Password?</Link>
      </p>
      <p className="mt-4">
        Don’t have an account?{' '}
        <Link href="/signup">
          <span className="text-blue-500 cursor-pointer">Sign Up</span>
        </Link>
      </p>
      <p className="mt-4">
        Back to{' '}
        <Link href="/">
          <span className="text-blue-500 cursor-pointer">HomePage</span>
        </Link>
      </p>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}

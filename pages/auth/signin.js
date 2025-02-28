import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } else {
      setMessage('Sign in successful!');
      setTimeout(() => {
        setMessage('');
        router.push('/');
      }, 1500);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="mt-28 mb-4 pt-4 max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200">
      <div className="text-center mb-6">
        <h1 className="mt-4 border-b border-gray-100 text-2xl font-bold">⚡EPHANTRONICS⚡</h1>
        <p className="my-2 text-sm font-bold text-gray-800">Experience the best services as never before</p>
        <h1 className="text-2xl font-bold text-green-600">Sign In</h1>
      </div>
      <form onSubmit={handleSignIn} className="p-4 space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:border-green-500"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:border-green-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition duration-300"
        >
          Sign In
        </button>
        {message && <p className="mb-4 text-center text-red-500">{message}</p>}
      </form>

      <div className="flex items-center justify-center">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-500">OR</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <div className='mx-4'><button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full mt-4 flex items-center justify-center bg-white border border-gray-300 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition duration-300"
      >
        <FcGoogle size={24} className="mr-2" /> Continue with Google
      </button></div>

      <p className="py-4 text-center text-blue-500 hover:underline">
        <Link href="/auth/forgot-password">Forgot Password?</Link>
      </p>
      <p className="text-center">
        Don’t have an account?{' '}
        <Link href="/auth/signup">
          <span className="text-blue-500 hover:underline">Sign Up</span>
        </Link>
      </p>
      <p className="py-4 text-center">
        <Link href="/">
          <span className="text-blue-500 hover:underline">View Products</span>
        </Link>
      </p>
    </div>
  );
}

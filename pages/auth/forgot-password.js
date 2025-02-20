import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Password reset link sent! Check your email.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="mt-24 mb-4 pt-4 max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200">
      <div className="text-center mb-6">
        <h1 className="mt-4 border-b border-gray-100 text-2xl font-bold text-black-600">⚡EPHANTRONICS⚡</h1>
        <p className="my-2 text-1xl font-bold text-gray-800">Experience the best services as never before</p>
        <h1 className="text-2xl font-bold text-green-600">Forgot Password</h1>
      </div>
      <form onSubmit={handleResetPassword} className="px-4 space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:border-green-500"
          required
        />
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition duration-300">
          Send Reset Link
        </button>
      </form>
      <p className="py-4 text-center">
        <Link href="/auth/signin">
          <span className="text-blue-500 hover:underline">Sign In</span>
        </Link>
      </p>
      {message && <p className="mb-4 text-center text-red-500">{message}</p>}
    </div>
  );
}
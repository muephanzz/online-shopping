import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password } = formData;

    if (!firstName || !lastName || !email || !password) {
      setMessage('All fields are required!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      const user = data.user;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, first_name: firstName, last_name: lastName, user_id: user.id }]);

      if (profileError) {
        setMessage(`Profile Error: ${profileError.message}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Signup successful! Check your email for confirmation.');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  return (
    <div className="mt-24 mb-4 pt-4 max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200">
      <div className="text-center mb-6">
        <h1 className="mt-4 border-b border-gray-100 text-2xl font-bold text-black-600">⚡EPHANTRONICS⚡</h1>
        <p className="my-2 text-1xl font-bold text-gray-800">Experience the best services as never before</p>
        <h1 className="text-2xl font-bold text-green-600">Sign Up</h1>
      </div>
      <form onSubmit={handleSignup} className="px-4 space-y-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:border-green-500"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
          className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:border-green-500"
          required
        />
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
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition duration-300">
          Sign Up
        </button>
      </form>
      <p className="my-4 text-center">
        Already have an account?{' '}
        <Link href="/auth/signin">
          <span className="text-blue-500 hover:underline">Sign In</span>
        </Link>
      </p>
      {message && <p className="mb-4 text-center text-red-500">{message}</p>}
    </div>
  );
}

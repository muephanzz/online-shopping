import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
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
        .insert([{ id: user.id, first_name: firstName, last_name: lastName }]);

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
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
          className="border p-2 w-full mb-4"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
          className="border p-2 w-full mb-4"
          required
        />
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
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Sign Up
        </button>
      </form>
      <p className="mt-4">
        Already have an account?{' '}
        <Link href="/signin">
          <span className="text-blue-500 cursor-pointer">Sign In</span>
        </Link>
      </p>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}

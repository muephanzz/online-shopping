"use client"; // Ensures compatibility with App Router

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SignIn({ onClose }) {
  const [view, setView] = useState('signIn'); // 'signIn' | 'signUp' | 'forgotPassword'
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const modalRef = useRef(null);

  const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="px-2 sm:p-0 lg:p-0 sm:w-1/2 w-full lg:w-1/4 fixed top-20 right-0 z-50">
      <div ref={modalRef} className=" fixed bg-purple-300 shadow-lg rounded-lg px-5 pb-5 pt-1 w-full relative">
        {/* Google Auth Button */}
        {view !== 'forgotPassword' && (
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                if (error) throw error;
                toast.success('Redirecting to Google login...');
              } catch (error) {
                toast.error(error.message);
              } finally {
                setLoading(false);
              }
            }}
            className="w-full mt-2 flex items-center justify-center bg-gray-100 py-2 mt-3 rounded-md text-gray-700 hover:bg-gray-200"
          >
            <FcGoogle className="mr-2" size={20} /> Continue with Google
          </button>
        )}

        {/* Title */}
          <h2 className="text-lg font-semibold text-center text-blue-600">
          {view === 'signIn' ? 'Sign In' : view === 'signUp' ? 'Create Account' : 'Reset Password'}
        </h2>

        {/* Authentication Form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              if (view === 'signIn') {
                const { error } = await supabase.auth.signInWithPassword({
                  email: form.email,
                  password: form.password,
                });
                if (error) throw error;
                toast.success('Signed in successfully!');
                router.refresh(); // Refresh page to update session
              } else if (view === 'signUp') {
                const { error } = await supabase.auth.signUp({
                  email: form.email,
                  password: form.password,
                  options: {
                    data: { first_name: form.firstName, last_name: form.lastName },
                  },
                });
                if (error) throw error;
                toast.success('Check your email to confirm your account!');
              } else {
                const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
                  redirectTo: 'http://localhost:3000/reset-password',
                });
                if (error) throw error;
                toast.success('Check your email for reset instructions!');
                setView('signIn');
              }
              onClose();
            } catch (error) {
              toast.error(error.message);
            } finally {
              setLoading(false);
            }
          }}
          className="mt-3 space-y-3"
        >
          {/* First & Last Name (Only for Sign Up) */}
          {view === 'signUp' && (
            <div className="flex space-x-2">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={updateForm}
                className="w-1/2 px-3 py-2 border rounded-md focus:ring focus:ring-blue-200 text-sm"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={updateForm}
                className="w-1/2 px-3 py-2 border rounded-md focus:ring focus:ring-blue-200 text-sm"
                required
              />
            </div>
          )}

          {/* Email Input */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={updateForm}
            className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200 text-sm"
            required
          />

          {/* Password Input (Not for Forgot Password) */}
          {view !== 'forgotPassword' && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={updateForm}
                className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Processing...' : view === 'signIn' ? 'Sign In' : view === 'signUp' ? 'Sign Up' : 'Reset Password'}
          </button>
        </form>

        {/* Links for Forgot Password and Sign Up / Sign In */}
        <div className="text-sm text-center mt-3 flex justify-center space-x-3">
          {view === 'signIn' ? (
            <>
              <button onClick={() => setView('forgotPassword')} className="text-blue-600">
                Forgot password?
              </button>
              <span>|</span>
              <button onClick={() => setView('signUp')} className="text-blue-600">
                Create Account
              </button>
            </>
          ) : view === 'signUp' ? (
            <>
              <span>Already have an account?</span>
              <button onClick={() => setView('signIn')} className="text-blue-600">
                Sign In
              </button>
            </>
          ) : (
            <>
              <span>Remember your password?</span>
              <button onClick={() => setView('signIn')} className="text-blue-600">
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

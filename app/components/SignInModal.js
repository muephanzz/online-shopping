"use client";

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from "../lib/supabaseClient";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from "@/context/AuthContext"; // ✅ useAuth hook
import 'react-toastify/dist/ReactToastify.css';

export default function SignIn({ onClose }) {
  const [view, setView] = useState('signIn');
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const modalRef = useRef(null);
  const { setUser } = useAuth(); // ✅ from AuthContext

  const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    <div className="fixed inset-0 flex items-start justify-center z-50 px-4 py-12 bg-black bg-opacity-30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full sm:w-[400px] bg-white rounded-xl shadow-2xl p-6 relative animate-fadeIn"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
          <X size={20} />
        </button>

        {/* Google Sign-In */}
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
            className="w-full flex items-center justify-center bg-gray-100 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition"
          >
            <FcGoogle className="mr-2" size={20} /> Continue with Google
          </button>
        )}

        <h2 className="text-xl font-semibold text-center text-blue-600 mt-5">
          {view === 'signIn' ? 'Sign In' : view === 'signUp' ? 'Create Account' : 'Reset Password'}
        </h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              if (view === 'signIn') {
                const { data, error } = await supabase.auth.signInWithPassword({
                  email: form.email,
                  password: form.password,
                });
                if (error) throw error;
                toast.success('Signed in successfully!');
                router.refresh();
              } else if (view === 'signUp') {
                const { error } = await supabase.auth.signUp({
                  email: form.email,
                  password: form.password,
                  options: {
                    data: {
                      first_name: form.firstName,
                      last_name: form.lastName,
                    },
                  },
                });
                if (error) throw error;
                toast.success('Check your email to confirm your account!');
              } else {
                const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
                  redirectTo: 'https://online-shopping-steel-eta.vercel.app/reset-password',
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
          className="mt-4 space-y-4"
        >
          {view === 'signUp' && (
            <div className="flex gap-2">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={updateForm}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={updateForm}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={updateForm}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300"
            required
          />

          {view !== 'forgotPassword' && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={updateForm}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            disabled={loading}
          >
            {loading ? 'Processing...' : view === 'signIn' ? 'Sign In' : view === 'signUp' ? 'Sign Up' : 'Reset Password'}
          </button>
        </form>

        <div className="text-sm text-center mt-4 space-x-2">
          {view === 'signIn' ? (
            <>
              <button onClick={() => setView('forgotPassword')} className="text-blue-600 hover:underline">
                Forgot password?
              </button>
              <span>|</span>
              <button onClick={() => setView('signUp')} className="text-blue-600 hover:underline">
                Create Account
              </button>
            </>
          ) : view === 'signUp' ? (
            <>
              <span>Already have an account?</span>
              <button onClick={() => setView('signIn')} className="text-blue-600 hover:underline ml-1">
                Sign In
              </button>
            </>
          ) : (
            <>
              <span>Remember your password?</span>
              <button onClick={() => setView('signIn')} className="text-blue-600 hover:underline ml-1">
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

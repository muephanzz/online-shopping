// components/SignInModal.js
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SignInModal({ isOpen, onClose }) {
  const [view, setView] = useState('signIn');
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.getElementById('email').focus();
      const savedEmail = localStorage.getItem('rememberMe');
      if (savedEmail) setForm((prev) => ({ ...prev, email: savedEmail }));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateInput = () => {
    const { email, password, first_name, last_name } = form;
    if (!email || !email.includes('@')) return 'Invalid email address';
    if (view !== 'forgotPassword' && password.length < 8) return 'Password must be at least 8 characters';
    if (view === 'signUp' && (!first_name || !last_name)) return 'First and last names are required';
    return null;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const errorMsg = validateInput();
    if (errorMsg) {
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      if (view === 'signIn') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;

        if (!data.user) {
          toast.info('Check your email to confirm your account.');
          return;
        }

        if (rememberMe) {
          localStorage.setItem('rememberMe', form.email);
        } else {
          localStorage.removeItem('rememberMe');
        }

        router.push('/');
      } else if (view === 'signUp') {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { first_name: form.first_name, last_name: form.last_name } },
        });
        if (error) throw error;
        toast.success('Check your email to confirm your account!');
      } else if (view === 'forgotPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        toast.success('Password reset email sent!');
      }

      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      toast.success('Redirecting to Google login...');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-60 flex justify-center items-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-colors" aria-label="Close Modal">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-blue-600 text-center">
          {view === 'signIn' ? 'Welcome Back' : view === 'signUp' ? 'Create an Account' : 'Reset Password'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          {view === 'signUp' && (
            <>
              {['first_name', 'last_name'].map((field) => (
                <div key={field}>
                  <label className="block mb-2 font-medium capitalize text-sm text-gray-700">
                    {field.replace('_', ' ')}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={form[field]}
                    onChange={updateForm}
                    className="w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-200 text-sm"
                    placeholder={`Enter your ${field.replace('_', ' ')}`}
                    autoComplete={field}
                    required
                  />
                </div>
              ))}
            </>
          )}

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={updateForm}
              className="w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-200 text-sm"
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          {view !== 'forgotPassword' && (
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={updateForm}
                  className="w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-200 text-sm"
                  placeholder="Enter your password"
                  autoComplete={view === 'signUp' ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            disabled={loading}
          >
            {loading ? 'Processing...' : view === 'signIn' ? 'Sign In' : view === 'signUp' ? 'Sign Up' : 'Send Reset Link'}
          </button>
          {view !== 'forgotPassword' && (
            <button
            onClick={handleGoogleAuth}
            className="w-full mt-4 flex items-center justify-center bg-white border border-gray-300 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition duration-300"
          >
            <FcGoogle className="mr-2" size={24} /> Continue with Google
          </button>
        )}

                {/* Switch Views */}
                <p className="mt-4 text-center">
          {view === 'signIn' ? (
            <>
              New here?{' '}
              <button onClick={() => setView('signUp')} className="text-blue-600 hover:underline">
                Create an account
              </button>{' '}
              <br />
              Forgot password?{' '}
              <button
                onClick={() => setView('forgotPassword')}
                className="text-blue-600 hover:underline"
              >
                Reset it
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setView('signIn')} className="text-blue-600 hover:underline">
                Sign In
              </button>
            </>
          )}
        </p>
        </form>
      </motion.div>
    </motion.div>
  );
}

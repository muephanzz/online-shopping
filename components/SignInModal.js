import { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SignIn({ onClose }) {
  const [view, setView] = useState('signIn');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
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
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({ email: form.email, password: form.password });
        if (error) throw error;
        toast.success('Check your email to confirm your account!');
      }
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
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
  };

  return (
    <div className="fixed top-10 right-4 bg-white shadow-md rounded-lg p-4 w-80">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
        <X size={20} />
      </button>
      <h2 className="text-lg font-semibold text-center text-blue-600">
        {view === 'signIn' ? 'Sign In' : 'Create Account'}
      </h2>
      <button
        onClick={handleGoogleAuth}
        className="w-full flex items-center justify-center bg-gray-100 py-2 mt-2 rounded-md text-gray-700 hover:bg-gray-200"
      >
        <FcGoogle className="mr-2" size={20} /> Continue with Google
      </button>
      <form onSubmit={handleAuth} className="mt-3 space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={updateForm}
          className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200 text-sm"
          required
        />
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
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Processing...' : view === 'signIn' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      <p className="text-sm text-center mt-3">
        {view === 'signIn' ? (
          <>No account? <button onClick={() => setView('signUp')} className="text-blue-600">Sign up</button></>
        ) : (
          <>Have an account? <button onClick={() => setView('signIn')} className="text-blue-600">Sign in</button></>
        )}
      </p>
    </div>
  );
}

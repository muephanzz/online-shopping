import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { prisma } from '../lib/prisma';

export default function AuthForms() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    emailOrPhone: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        setError('');
        setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
  
    const { emailOrPhone, password, fname, lname } = formData;
  
    try {
      // Step 1: Send sign-up request to the backend
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrPhone, password, fname, lname }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setMessage(data.message);  // Success message
        setIsSignUp(false);  // Automatically switch to sign-in form after successful sign-up
      } else {
        setError(data.error);  // Show error message
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error:', err);
    }
  };
  

  
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    const { emailOrPhone, password } = formData;
    const isEmail = emailOrPhone.includes('@');

    const { data, error } = await supabase.auth.signInWithPassword({
      [isEmail ? 'email' : 'phone']: emailOrPhone,
      password
    });

    if (error) {
      setError('Invalid credentials, please sign up if you don\'t have an account.');
    } else {
      router.push('/dashboard');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { emailOrPhone } = formData;
    const isEmail = emailOrPhone.includes('@');

    const { data, error } = await supabase.auth.resetPasswordForEmail(
      emailOrPhone,
      {
        redirectTo: 'http://localhost:3000/reset-password'
      }
    );

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email/phone for the OTP to reset your password.');
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { emailOrPhone, password } = formData;
    const isEmail = emailOrPhone.includes('@');

    const { data, error } = await supabase.auth.verifyOtp({
      [isEmail ? 'email' : 'phone']: emailOrPhone,
      token: otp,
      type: 'recovery'
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('OTP verified. You can now set a new password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? 'Create an Account' : isResetPassword ? 'Reset Password' : 'Welcome Back'}
        </h2>

        <form onSubmit={isSignUp ? handleSignUp : isResetPassword ? handlePasswordReset : handleSignIn} className="space-y-4">
          {isSignUp && (
            <div className="flex space-x-2">
              <input
                type="text"
                name="fname"
                placeholder="First Name"
                className="border p-2 w-1/2 rounded-xl"
                value={formData.fname}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lname"
                placeholder="Last Name"
                className="border p-2 w-1/2 rounded-xl"
                value={formData.lname}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <input
            type="text"
            name="emailOrPhone"
            placeholder="Email or Phone Number"
            className="border p-2 w-full rounded-xl"
            value={formData.emailOrPhone}
            onChange={handleChange}
            required
          />

          {!isResetPassword && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border p-2 w-full rounded-xl"
              value={formData.password}
              onChange={handleChange}
              required
            />
          )}

          {isResetPassword && (
            <>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                className="border p-2 w-full rounded-xl"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                type="button"
                onClick={handleOtpVerification}
                className="w-full py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white"
              >
                Verify OTP
              </button>
            </>
          )}

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSignUp ? 'Sign Up' : isResetPassword ? 'Send OTP' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center">
          {isSignUp ? 'Already have an account?' : isResetPassword ? 'Remembered your password?' : "Don't have an account?"}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setIsResetPassword(false);
            }}
            className="ml-2 text-blue-500 hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {!isSignUp && !isResetPassword && (
          <p className="mt-2 text-center">
            <button
              onClick={() => setIsResetPassword(true)}
              className="text-blue-500 hover:underline"
            >
              Forgot Password?
            </button>
          </p>
        )}

        {(error || message) && (
          <p className={`mt-4 text-center ${error ? 'text-red-500' : 'text-green-500'}`}>
            {error || message}
          </p>
        )}
      </div>
    </div>
  );
}

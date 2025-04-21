"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";

export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(form);
      if (error) throw error;

      toast.success("Signed in Successfully!");
      window.location.href = "/";
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-center mb-6 text-blue-600">Sign In</h2>
      {/*       
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center bg-gray-100 py-2 rounded-lg mb-4 text-sm hover:bg-gray-200"
        >
          <FcGoogle className="mr-2" size={20} /> Continue with Google
        </button> */} 

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex justify-center space-x-2">
          <p className="text-sm text-center mt-4">
            <a href="/reset-password" className="text-blue-600 hover:underline">
              Reset Password
            </a>
          </p>
          <p className="text-sm text-center mt-4">{"| "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

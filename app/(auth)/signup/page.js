"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import Link from "next/link";

export default function SignUpPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
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
      toast.success("Check your email to confirm your account!");
      router.replace("/signin");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-center mb-6 text-blue-600">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />       
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import axios from "axios";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send sign-up data to your API route
      const response = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      if (response.status === 200) {
        // After successful sign-up, log in the user automatically
        signIn("credentials", { email, password, redirect: true, callbackUrl: "/" });
      }
    } catch (error) {
      setError("Sign-up failed! Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        {error && <div className="text-red-500">{error}</div>}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-lg w-full">
          Sign Up
        </button>
      </form>
    </div>
  );
}

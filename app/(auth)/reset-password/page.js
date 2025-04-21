"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const ResetPassword = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800">🔑 Reset Password</h2>
        <p className="text-gray-500 text-center text-sm mt-2">
          Enter your new password below.
        </p>

        <div className="mt-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleResetPassword}
          disabled={loading}
          className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Reset Password"}
        </button>

        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes("✅") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}

        <p className="text-sm text-center mt-4">
          Go back to{" "}
          <Link href="/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;

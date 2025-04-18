"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ComingSoonPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-xl rounded-3xl px-8 py-12 text-center max-w-md w-full"
      >
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">🚧 Coming Soon</h1>
        <p className="text-gray-600 text-sm">
          This page is under construction. You’ll be redirected to the homepage shortly...
        </p>
      </motion.div>
    </div>
  );
}

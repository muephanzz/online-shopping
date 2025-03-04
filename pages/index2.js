// pages/index.js (or app/page.js if using App Router)
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import SignInModal from '../components/SignInModal';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    // Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === "SIGNED_IN") router.push('/dashboard');
      if (event === "SIGNED_OUT") router.push('/');
    });

    return () => authListener.subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to Your Platform</h1>

      {user ? (
        <div>
          <p>Hello, {user.email}</p>
          <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Sign In / Sign Up
        </button>
      )}

      {modalOpen && <SignInModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />}
    </main>
  );
}

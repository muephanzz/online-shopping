// pages/dashboard.js (or app/dashboard/page.js if using App Router)
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/');
      setUser(user);
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
        {user && <p>Welcome, {user.email}</p>}
        <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
    </main>
  );
}

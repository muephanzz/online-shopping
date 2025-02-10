import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-blue-600">MyStore</h1>
        </Link>

        <div className="space-x-4">
          <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link href="/products" className="text-gray-700 hover:text-blue-600">Products</Link>
          {user ? (
            <>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600">Profile</Link>
              <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-gray-700 hover:text-blue-600">Sign In</Link>
              <Link href="/signup" className="text-gray-700 hover:text-blue-600">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

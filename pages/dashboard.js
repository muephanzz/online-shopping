import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin'); // Redirect to Sign-In if not logged in
      } else {
        setUser(session.user);
      }
    };

    getSession();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        {user ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.email}!</h1>
            <button
              className="bg-red-500 text-white p-2 rounded w-full"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/signin');
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

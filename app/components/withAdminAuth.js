"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

const withAdminAuth = (WrappedComponent) => {
  return function AdminComponent(props) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/');
          return;
        }

        // Check for admin role in user metadata
        if (user.user_metadata?.role === 'admin') {
          setIsAdmin(true);
        } else {
          router.push('/access-denied');
        }

        setLoading(false);
      };

      checkAdmin();
    }, []);

    if (loading) return <p>Loading...</p>;

    return isAdmin ? <WrappedComponent {...props} /> : null;
  };
};

export default withAdminAuth;

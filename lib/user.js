import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export const useUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error) setUser(user);
    };

    fetchUser();
  }, []);

  return { user };
};

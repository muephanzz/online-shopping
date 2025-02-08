import { supabase } from '../lib/supabaseClient';

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Sign-Up Error:', error.message);
    return { error: error.message };
  }

  console.log('Sign-Up Success:', data);
  return { user: data.user };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign-In Error:', error.message);
    return { error: error.message };
  }

  console.log('Sign-In Success:', data);
  return { user: data.user };
};

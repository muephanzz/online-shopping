import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../app/globals.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch initial session
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setUser(sessionData?.session?.user || null);
    };

    fetchUser();

    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Cleanup subscription on unmount
    return () => data?.subscription?.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Navbar user={user} setUser={setUser} />
      <Toaster position="top-right"  autoClose={800}/>
      <ToastContainer position="top-right" autoClose={800} />
      <Component {...pageProps} />
      <BottomNav />
    </QueryClientProvider>
  );
}

export default MyApp;

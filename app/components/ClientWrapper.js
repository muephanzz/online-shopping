"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();

export default function ClientWrapper({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setUser(sessionData?.session?.user || null);
    };

    fetchUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      if (data && data.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Navbar user={user} setUser={setUser} />
      <Toaster position="top-right" autoClose={800} />
      <ToastContainer position="top-right" autoClose={800} />
      {children}
      <BottomNav />
    </QueryClientProvider>
  );
}

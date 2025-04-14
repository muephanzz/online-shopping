"use client"; // Mark this file as a client component

import { Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import { useAuth } from "@/context/AuthContext"; // Import the AuthContext
import Loading from "@/Loading"; // Import the loading component
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";

// Create a new query client for react-query
const queryClient = new QueryClient();

export default function ClientWrapper({ children }) {
  const { user, setUser } = useAuth(); // Access user and setUser from AuthContext
  const [isLoading, setIsLoading] = useState(true); // Track the loading state

  // Add blur effect to body when loading starts
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("loading-state"); // Apply blur on first load
    } else {
      document.body.classList.remove("loading-state"); // Remove blur after loading
    }

    return () => {
      document.body.classList.remove("loading-state"); // Clean up on unmount
    };
  }, [isLoading]);

  // Set isLoading to false once the page is fully loaded
  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <Suspense fallback={<Loading />}>
      <QueryClientProvider client={queryClient}>
        <Navbar user={user} setUser={setUser} />
        <Toaster position="top-right" autoClose={800} />
        <ToastContainer position="top-right" autoClose={800} />
        <div onLoad={handleLoadComplete}>{children}</div> {/* Mark page as loaded */}
        <BottomNav />
      </QueryClientProvider>
    </Suspense>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

function LayoutWrapper({ children }) {
  const { user, setUser } = useAuth();
  const pathname = usePathname();
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "");
  const hideNav = 
  ["/signin", "/signup", "/reset-password", 
  "/admin/dashboard", "/admin/products", "/admin/orders", 
  "/admin/chat", "/access-denied", "/coming-soon"]
  .includes(cleanPath);
  
  return (
    <>
      {!hideNav && <Navbar user={user} setUser={setUser} />}
      <Toaster position="top-right" autoClose={800} />
      <ToastContainer position="top-right" autoClose={800} />
      {children}
      {!hideNav && <BottomNav />}
    </>
  );
}

export default function ClientWrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LayoutWrapper>{children}</LayoutWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
}

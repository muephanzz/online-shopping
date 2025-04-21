"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccessDenied () {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-700">You do not have access to view this page.</p>
      </div>
    );
  };
  
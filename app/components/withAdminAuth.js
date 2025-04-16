"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const withAdminAuth = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/");
          return;
        }

        const { data: isAdmin } = await supabase.rpc("check_is_admin", {
          uid: user.id,
        });

        if (!isAdmin) {
          router.replace("/admin/access-denied");
          return;
        }

        setIsAdmin(true);
        setLoading(false);
      };

      checkAdmin();
    }, []);

    if (loading) return <p className="text-center mt-10">Verifying admin...</p>;
    return isAdmin ? <WrappedComponent {...props} /> : null;
  };
};

export default withAdminAuth;

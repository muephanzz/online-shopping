"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


const withAdminAuth = (WrappedComponent) => {
  return function AdminComponent(props) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkAdmin = async () => {
        setLoading(true);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error fetching user:", userError);
          router.push("/");
          return;
        }

        // Fetch is_admin from auth.users using an RPC function
        const { data: isAdminData, error: adminError } = await supabase.rpc("check_is_admin", { uid: user.id });

        if (adminError) {
          console.error("Error checking admin status:", adminError);
          setLoading(false);
          return;
        }

        setIsAdmin(isAdminData);
        setLoading(false);
      };

      checkAdmin();
    }, []);

    if (loading) return <p>Loading...</p>;

    return isAdmin ? <WrappedComponent {...props} /> : null;
  };
};

export default withAdminAuth;

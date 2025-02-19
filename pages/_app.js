import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../app/globals.css';
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/signin"); // Redirect to sign-in on logout
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;

import Navbar from '../components/Navbar';
import BottomNav from "../components/BottomNav";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../app/globals.css';
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Toaster position="top-right" autoClose={800} />
      <ToastContainer position="top-right" autoClose={800} />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
      <BottomNav /> 
    </>
  );
}

export default MyApp;
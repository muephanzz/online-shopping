import Navbar from '../components/Navbar/Navbar';
import BottomNav from "../components/BottomNav";
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Component {...pageProps} />
      <BottomNav /> 
      <Footer />
    </>
  );
}

export default MyApp;

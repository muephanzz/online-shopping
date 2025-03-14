import Navbar from '../components/Navbar';
import BottomNav from "../components/BottomNav";
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
    </>
  );
}

export default MyApp;

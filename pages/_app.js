import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import 'globals';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;

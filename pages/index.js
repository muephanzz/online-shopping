import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import UnifiedChat from '../components/UnifiedChat';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Image from "next/image";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [totalPages, setTotalPages] = useState(1);

  // Local slideshow images stored in the public folder
  const slides = [
    "/home1.webp",
    "/home2.webp",
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      const { data, count, error } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .range(start, end);

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      setLoading(false);
    }

    fetchProducts();
  }, [currentPage]);

  return (
    <div className="py-2 mt-20">
      <h1 className="text-4xl font-extrabold text-center mb-12">Our Products</h1>
      
      {/* Slideshow */}
      <div className="mb-12">
        <Slider {...sliderSettings}>
          {slides.map((image, index) => (
            <div key={index} className="relative w-full h-[300px] md:h-[500px]">
              <Image
                src={image}
                alt={`Slide ${index + 1}`}
                layout="fill"
                objectFit="cover"
                priority
              />
            </div>
          ))}
        </Slider>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>

          <UnifiedChat />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <div className="mt-60">
        <Footer />
      </div>
    </div>
  );
}

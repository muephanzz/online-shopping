import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import UnifiedChat from "../components/UnifiedChat";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [totalPages, setTotalPages] = useState(1);
  const [slides, setSlides] = useState([]);

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

    async function fetchSlides() {
      const { data, error } = await supabase
        .from("slides")
        .select("image_url, link");

      if (error) {
        console.error("Error fetching slides:", error);
      } else {
        setSlides(data);
      }
    }

    fetchProducts();
    fetchSlides();
  }, [currentPage]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
  };

  return (
    <div className="py-2 mt-20">
      <h1 className="text-4xl font-extrabold text-center mb-12">Our Products</h1>

      {/* Slideshow */}
      <div className="mb-12">
        <Slider {...sliderSettings}>
          {slides.map((slide, index) => (
            <a key={index} href={slide.link} target="_blank" rel="noopener noreferrer">
              <Image
                src={slide.image_url}
                alt="Slide image"
                width={1200}
                height={500}
                className="rounded-lg"
              />
            </a>
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

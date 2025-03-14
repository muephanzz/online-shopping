import { useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import UnifiedChat from "../components/UnifiedChat";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const products = [
    { product_id: 1, name: "Product 1", price: 100 },
    { product_id: 2, name: "Product 2", price: 200 },
  ];

  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Local slideshow images stored in the public folder
  const slides = [
    "/slides/slide1.jpg",
    "/slides/slide2.jpg",
    "/slides/slide3.jpg",
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

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

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Unified Chat */}
      <UnifiedChat />

      {/* Footer */}
      <div className="mt-60">
        <Footer />
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const supabase = createClient('https://znjrafazpveysjguzxri.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuanJhZmF6cHZleXNqZ3V6eHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMzg1OTAsImV4cCI6MjA1NDcxNDU5MH0.jdJDl_QoXDF-0_2FxQSt4qml-kj2jQtMmYsL4Vbk7Ks');

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  const addToCart = (product) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedCart.push({ ...product, quantity: 1 });
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  const mostPopular = products.filter((product) => product.price > 100); // Example filter
  const allProducts = products;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Slideshow */}
      <div className="mb-10">
        <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
          <div>
            <img src="/banner1.jpg" alt="Banner 1" className="rounded-xl w-full" />
          </div>
          <div>
            <img src="/banner2.jpg" alt="Banner 2" className="rounded-xl w-full" />
          </div>
          <div>
            <img src="/banner3.jpg" alt="Banner 3" className="rounded-xl w-full" />
          </div>
        </Carousel>
      </div>

      {/* Most Popular Products */}
      <h1 className="text-4xl font-bold text-center mb-6">Most Popular</h1>
      <ProductGrid products={mostPopular} addToCart={addToCart} />

      {/* All Products */}
      <h1 className="text-4xl font-bold text-center mt-10 mb-6">All Products</h1>
      <ProductGrid products={allProducts} addToCart={addToCart} />
    </div>
  );
}

// Component for Product Grid
const ProductGrid = ({ products, addToCart }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const productImage = product?.images?.length > 0 ? product.images[0] : "/default-image.jpg";

        return (
          <div key={product.id} className="relative group border rounded-2xl shadow-md overflow-hidden">
            <Link href={`/product/${product.id}`} className="block">
              <Image
                src={productImage}
                alt={product.name}
                width={300}
                height={300}
                className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
                <p className="text-green-600 text-lg font-bold">${product.price}</p>
              </div>
            </Link>
            <button
              onClick={() => addToCart(product)}
              className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
            </button>
          </div>
        );
      })}
    </div>
  );
};

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Loader2, Trash2, ShoppingCart } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWishlist = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .select("id, products (product_id, name, image_urls, price)")
        .eq("user_id", session.user.id);

      if (error) {
        toast.error("Failed to fetch wishlist.");
      } else {
        setWishlist(data || []);
      }
      setLoading(false);
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (wishlist_id) => {
    const { error } = await supabase.from("wishlist").delete().eq("id", wishlist_id);
    if (error) {
      toast.error("Failed to remove from wishlist.");
    } else {
      toast.success("Removed from wishlist.");
      setWishlist((prev) => prev.filter((item) => item.id !== wishlist_id));
    }
  };

  const addToCart = async (product) => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      toast.error("Please log in to add items to the cart.");
      return;
    }

    const { error } = await supabase.from("cart").insert({
      user_id: session.user.id,
      product_id: product.product_id,
      quantity: 1,
      price: product.price,
    });

    error ? toast.error("Failed to add to cart.") : toast.success("Added to cart!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-28 text-gray-600">
        <p className="text-xl mb-4">Your wishlist is empty.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="mt-20 mb-20 px-4 md:px-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Your Wishlist</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => {
          const { products } = item;
          const imageUrl =
            Array.isArray(products.image_urls) && products.image_urls.length > 0
              ? products.image_urls[0]
              : "/placeholder.jpg";

          return (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition">
              <ProductCard
                product={{
                  ...products,
                  image_urls: [imageUrl],
                }}
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => addToCart(products)}
                  className="flex-1 flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="flex-1 flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

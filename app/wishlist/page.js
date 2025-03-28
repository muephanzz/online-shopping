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
        console.error("Error fetching session:", sessionError?.message);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .select("id, products (product_id, name, image_urls, price)")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching wishlist:", error.message);
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
      console.error("Error removing from wishlist:", error.message);
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

    if (error) {
      console.error("Error adding to cart:", error.message);
      toast.error("Failed to add to cart.");
    } else {
      toast.success("Added to cart!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="mt-28 text-center">
        <p className="text-lg text-gray-600">Your wishlist is empty.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="mt-20 mb-20 p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Your Wishlist</h1>
      <div className="border rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
        {wishlist.map((item) => {
          const imageUrl = Array.isArray(item.products.image_urls) && item.products.image_urls.length > 0
            ? item.products.image_urls[0]
            : "/placeholder.jpg";

          return (
            <div key={item.id} className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <div className="mt-4">
                <ProductCard />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => addToCart(item.products)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex-1"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex-1"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

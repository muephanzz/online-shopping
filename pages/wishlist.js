import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
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
        <Image width={500} height={500} unoptimized src="/wishlist.jpg" alt="Wishlist Empty" className="mx-auto w-60 mb-4" />
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
    <div className="mt-28 p-4 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Your Wishlist</h1>

      <div className="space-y-6">
        {wishlist.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b pb-4">
            <Image 
              width={500} 
              height={500} 
              unoptimized 
              src={item.products.image_urls} 
              alt={item.products.name} 
              className="w-24 h-24 object-cover rounded-lg" 
            />

            <div className="text-left flex-1 px-4">
              <h3 className="text-lg font-medium text-gray-800">{item.products.name}</h3>
              <p className="text-blue-600 font-bold">Ksh {item.products.price.toFixed(2)}</p>
            </div>

            <button 
              onClick={() => removeFromWishlist(item.id)} 
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 className="w-5 h-5 mr-2" /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

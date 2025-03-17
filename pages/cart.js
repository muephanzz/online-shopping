import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { Loader2, Trash2, Heart, AlertCircle } from "lucide-react";
import Image from "next/image";
import OrderSummary from "../components/OrderSummary";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) return console.error("Error fetching session:", error.message);
    
      if (session?.user) {
        const { data: cartData, error: cartError } = await supabase
          .from("cart")
          .select("*")
          .eq("user_id", session.user.id);
    
        if (cartError) return console.error("Error fetching cart:", cartError.message);
    
        // Fetch product details separately
        const productIds = cartData.map(item => item.product_id);
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("product_id, stock")
          .in("product_id", productIds);
    
        if (productsError) return console.error("Error fetching products:", productsError.message);
    
        // Merge cart data with product stock info
        const cartWithStock = cartData.map(item => ({
          ...item,
          stock: productsData.find(p => p.product_id === item.product_id)?.stock || 0
        }));
    
        setCartItems(cartWithStock);
      }
      setLoading(false);
    };
    

    const fetchWishlist = async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id");
      if (error) console.error("Error fetching wishlist:", error.message);
      setWishlist(data?.map((item) => item.product_id) || []);
    };

    fetchCart();
    fetchWishlist();
  }, []);

  const handleRemoveItem = async (cart_id) => {
    const { error } = await supabase.from("cart").delete().eq("cart_id", cart_id);

    if (error) {
      console.error("Error removing item:", error.message);
      toast.error("Failed to remove item.");
    } else {
      setCartItems((prev) => prev.filter((item) => item.cart_id !== cart_id));
      toast.success("Item removed from cart.");
    }
  };

  const updateQuantity = async (cart_id, quantity, stock) => {
    if (quantity < 1 || quantity > stock) {
      toast.warning("Cannot exceed available stock.");
      return;
    }
    const { error } = await supabase
      .from("cart")
      .update({ quantity })
      .eq("cart_id", cart_id);

    if (error) {
      console.error("Error updating quantity:", error.message);
      toast.error("Failed to update quantity.");
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_id === cart_id ? { ...item, quantity } : item
        )
      );
      toast.success("Quantity updated.");
    }
  };

  const addToWishlist = async (item) => {
    if (wishlist.includes(item.product_id)) {
      toast.info("Already in wishlist!");
      return;
    }

    const { error } = await supabase.from("wishlist").insert({
      user_id: item.user_id,
      product_id: item.product_id,
    });

    if (error) {
      console.error("Error adding to wishlist:", error.message);
      toast.error("Failed to add to wishlist.");
    } else {
      setWishlist([...wishlist, item.product_id]);
      toast.success("Added to wishlist!");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = cartItems.length > 0 ? 119 : 0;
  const outOfStockItems = cartItems.some((item) => (item?.stock || 0) < item.quantity);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mt-28 text-center">
        <Image
          width={500}
          height={500}
          unoptimized
          src="/cart.jpg"
          alt="Empty Cart"
          className="mx-auto w-60 mb-4"
        />
        <p className="text-lg text-gray-600">Oooops! Your cart is empty.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Explore Trending Products
        </button>
      </div>
    );
  }

  return (
    <div className="mt-28 p-4 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Your Cart</h1>

      <div className="space-y-6">
        {cartItems.map((item) => (
          <div
            key={item.cart_id}
            className="flex flex-col md:flex-row items-center justify-between border-b pb-4"
          >
            <Image
              width={500}
              height={500}
              unoptimized
              src={item.image_url}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-lg"
            />

            <div className="text-left flex-1 px-4">
              <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
              <p className="text-blue-600 font-bold">Ksh {(item.price * item.quantity).toFixed(2)}</p>
              <p className="text-sm text-red-500">In Stock: {item?.stock || 0 }</p>
              <div className="flex items-center space-x-4 mt-2">
                <button
                  onClick={() => updateQuantity(item.cart_id, item.quantity - 1, item?.stock)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cart_id, item.quantity + 1, item?.stock)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={item.quantity >= (item?.stock || 0)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => addToWishlist(item)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Heart className="w-5 h-5 mr-2" /> Wishlist
              </button>
              <button
                onClick={() => handleRemoveItem(item.cart_id)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              > Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link href="/wishlist">
        <button className="flex flex-col items-center text-gray-600 hover:text-black">
          <Heart size={24} />
          <span className="text-xs mt-1">Wishlist</span>
        </button>
      </Link>

      <OrderSummary subtotal={subtotal} shippingFee={shippingFee} />

      <button
        onClick={() => router.push({ pathname: "/orders/checkout", query: { total: subtotal.toFixed(2) } })}
        className={`mt-6 px-6 py-3 text-white rounded-lg w-full transition ${
          outOfStockItems ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
        disabled={outOfStockItems}
      >
        {outOfStockItems ? "Out of Stock Items in Cart" : "Proceed to Checkout"}
      </button>
    </div>
  );
}  
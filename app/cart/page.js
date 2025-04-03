"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Heart, LucideLoaderPinwheel, LoaderCircleIcon } from "lucide-react";
import Image from "next/image";
import OrderSummary from "../components/OrderSummary";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) return console.error("Error fetching session:", error.message);

      if (session?.user) {
        setUserId(session.user.id);
        fetchCart(session.user.id);
        fetchWishlist(session.user.id);
      }
    };

    const fetchCart = async (userId) => {
      const { data: cartData, error: cartError } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", userId);

      if (cartError) return console.error("Error fetching cart:", cartError.message);

      const productIds = cartData.map(item => item.product_id);
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("product_id, stock")
        .in("product_id", productIds);

      if (productsError) return console.error("Error fetching products:", productsError.message);

      const cartWithStock = cartData.map(item => ({
        ...item,
        stock: productsData.find(p => p.product_id === item.product_id)?.stock || 0
      }));

      setCartItems(cartWithStock);
      setLoading(false);
    };

    const fetchWishlist = async (userId) => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", userId);

      if (error) console.error("Error fetching wishlist:", error.message);
      setWishlist(data?.map((item) => item.product_id) || []);
    };

    fetchUserData();
  }, []);

  const addToWishlist = async (item) => {
    if (wishlist.includes(item.product_id)) {
      toast.info("Already in wishlist!");
      return;
    }

    const { error } = await supabase.from("wishlist").insert({
      user_id: userId,
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

  const handleRemoveItem = async (cart_id) => {
    const { error } = await supabase.from("cart").delete().eq("cart_id", cart_id);
    const confirmation = window.confirm("Are you sure you want to remove this product?");
    if (!confirmation) return;
    if (error) {
      toast.error("Failed to remove item.");
    } else {
      setCartItems((prev) => prev.filter((item) => item.cart_id !== cart_id));
      const updatedSelection = { ...selectedItems };
      delete updatedSelection[cart_id];
      setSelectedItems(updatedSelection);
      toast.success("Item removed from cart.");
    }
  };

  const toggleSelection = (cart_id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [cart_id]: !prev[cart_id],
    }));
  };

  const updateQuantity = async (cart_id, newQuantity) => {
    if (newQuantity < 1) return;

    const { error } = await supabase
      .from("cart")
      .update({ quantity: newQuantity })
      .eq("cart_id", cart_id);

    if (error) {
      toast.error("Failed to update quantity.");
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_id === cart_id ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success("Quantity updated!");
    }
  };

  const quantity = cartItems
    .filter((item) => item.quantity, 0);

  const subtotal = cartItems
    .filter((item) => selectedItems[item.cart_id])
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shippingFee = Object.keys(selectedItems).length > 0 ? 0 : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
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
      className="flex flex-co sm:flex-row items-center sm:justify-between border-b pb-4 gap-4"
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={!!selectedItems[item.cart_id]}
        onChange={() => toggleSelection(item.cart_id)}
        className="w-5 h-5"
      />

      {/* Product Image */}
      <Image
        width={500}
        height={500}
        unoptimized
        src={item.image_url}
        alt={item.name}
        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
      />

      {/* Product Info */}
      <div className="flex-1 px-4 text-center sm:text-left">
        <h3 className="text-sm sm:text-lg font-medium text-gray-800">{item.name}</h3>
        <p className="text-blue-600 font-bold text-sm sm:text-base">
          {item.quantity}*{item.price}
        </p>
        <h2>Ksh {item.price * item.quantity}</h2>
     </div>

      {/* Quantity Update Buttons */}
      <div className="flex-1 px-4 text-center sm:text-left">
        <button
          onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
          className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-300 text-gray-700 rounded-lg"
        >
          −
        </button>
        <span className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-100 rounded-lg">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
          className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-300 text-gray-700 rounded-lg"
        >
          +
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex-1 px-4 text-center sm:text-left">        
        <button
          onClick={() => addToWishlist(item)}
          className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Heart />
        </button>
        <button
          onClick={() => handleRemoveItem(item.cart_id)}
          className="px-3 py-1 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <Trash2 />
        </button>
      </div>
    </div>
  ))}
</div>

      
      <OrderSummary quantity={quantity} subtotal={subtotal} shippingFee={shippingFee} />
      <button
        onClick={() => {
          const selectedProducts = cartItems
            .filter((item) => selectedItems[item.cart_id])
            .map(({ image_url, name, price, quantity }) => ({
              image_url,
              name,
              price,
              quantity,
            }));

          if (selectedProducts.length === 0) {
            toast.warning("Please select at least one item.");
            return;
          }

          localStorage.setItem("checkoutItems", JSON.stringify(selectedProducts));

          router.push("/orders/checkout");
        }}
        className={`mt-6 mb-20 px-6 py-3 text-white rounded-lg w-full transition ${
          subtotal === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
        disabled={subtotal === 0}
      >
        {subtotal === 0 ? "Select items to proceed" : "Proceed to Checkout"}
      </button>
    </div>
  );
}
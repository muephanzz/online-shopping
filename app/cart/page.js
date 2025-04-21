"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Trash2, Heart, Loader2, X } from "lucide-react";
import Image from "next/image";
import OrderSummary from "../components/OrderSummary";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
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

    fetchUserData();
  }, []);

  const handleRemoveItem = async (cart_id) => {
    const confirmation = window.confirm("Are you sure you want to remove this product?");
    if (!confirmation) return;

    const { error } = await supabase.from("cart").delete().eq("cart_id", cart_id);
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
      .update({
        items: { ...cartItems.find((item) => item.cart_id === cart_id).items, quantity: newQuantity },
      })
      .eq("cart_id", cart_id);

    if (error) {
      toast.error("Failed to update quantity.");
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_id === cart_id
            ? { ...item, items: { ...item.items, quantity: newQuantity } }
            : item
        )
      );
      toast.success("Quantity updated!");
    }
  };

  const quantity = cartItems.filter((item) => item.items.quantity, 0);

  const subtotal = cartItems
    .filter((item) => selectedItems[item.cart_id])
    .reduce((sum, item) => sum + item.items.price * item.items.quantity, 0);

  const shippingFee = Object.keys(selectedItems).length > 0 ? 0 : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-28 p-4 max-w-5xl mx-auto bg-gradient-to-br from-white to-slate-100 shadow-xl rounded-2xl border"
    >
      <h1 className="text-3xl font-semibold mb-8 text-gray-800 tracking-tight">🛒 Your Exclusive Cart</h1>

      <div className="space-y-6">
        <AnimatePresence>
          {cartItems.map((item) => (
            <motion.div
              key={item.cart_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-co sm:flex-row items-center sm:justify-between bg-white rounded-xl shadow p-4 gap-4"
            >
              <input
                type="checkbox"
                checked={!!selectedItems[item.cart_id]}
                onChange={() => toggleSelection(item.cart_id)}
                className="w-5 h-5 accent-blue-600"
              />

              <Image
                width={500}
                height={500}
                unoptimized
                src={item.items.image_url}
                alt={item.items.name}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border"
              />

              <div className="flex-1 px-4 text-center sm:text-left">
                <h3 className="text-lg font-medium text-gray-800 leading-tight">{item.items.name}</h3>
                <p className="text-blue-600 font-bold text-sm">{item.items.quantity} × Ksh {item.items.price}</p>
                <p className="text-gray-700 font-semibold">Ksh {item.items.price * item.items.quantity}</p>
              </div>

              <div className="flex-1 px-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateQuantity(item.cart_id, item.items.quantity - 1)}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                >−</button>
                <span className="px-4 py-1 bg-gray-100 rounded-lg border text-gray-700">
                  {item.items.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.cart_id, item.items.quantity + 1)}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                >+</button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleRemoveItem(item.cart_id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <OrderSummary quantity={quantity} subtotal={subtotal} shippingFee={shippingFee} />

      <button
        onClick={() => {
          const selectedProducts = cartItems
            .filter((item) => selectedItems[item.cart_id])
            .map(({ items }) => items);

          if (selectedProducts.length === 0) {
            toast.warning("Please select at least one item.");
            return;
          }

          localStorage.setItem("checkoutItems", JSON.stringify(selectedProducts));
          router.push("/orders/checkout");
        }}
        className={`mt-6 mb-20 px-6 py-3 text-white font-medium rounded-lg w-full shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.01] ${
          subtotal === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
        disabled={subtotal === 0}
      >
        {subtotal === 0 ? "Select items to proceed" : "Proceed to Checkout"}
      </button>
    </motion.div>
  );
}

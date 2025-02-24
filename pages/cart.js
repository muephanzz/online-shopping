import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchSessionAndCart() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
  
      if (error) {
        console.error("Error fetching session:", error.message);
      } else if (session?.user) {
        setUser(session.user);
  
        const { data, error: cartError } = await supabase
          .from("cart")
          .select("*")
          .eq("user_id", session.user.id);
  
        if (cartError) {
          console.error("Error fetching cart:", cartError.message);
        } else {
          setCartItems(data);
        }
      }
      setLoading(false);
    }
  
    fetchSessionAndCart();
  }, []);

  const handleRemoveItem = async (cart_id) => {
    const { error } = await supabase.from("cart").delete().eq("cart_id", cart_id);

    if (error) {
      console.error("Error removing item:", error.message);
    } else {
      setCartItems(cartItems.filter((item) => item.cart_id !== cart_id));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = cartItems.length > 0 ? 10 : 0;
  const totalAmount = subtotal + shippingFee;

  return (
    <div className="mt-28 mb-4 p-4  text-center max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="border-y border-gray-100 m-2 text-3xl font-semibold text-gray-800">Your Cart</h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : cartItems.length === 0 ? (
        <>
          <Image  
          width={500} 
          height={500}
          unoptimized 
          src="/cart.jpg" 
          alt="Empty Cart" 
          className="mx-auto w-60 mb-4" />
          <p className="text-lg text-gray-600">Oooops! Your cart is empty.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Products
          </button>
        </>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.cart_id}
              className="flex flex-col md:flex-row items-center justify-between border-b pb-4 mb-4"
            >
              <Image                   width={500} 
                  height={500}
                  unoptimized src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="text-left flex-1 px-4">
                <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                <p className="text-blue-600 font-bold">Ksh{(item.price * item.quantity).toFixed(2)}</p>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.cart_id)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 className="w-5 h-5 mr-2" /> Remove
              </button>
            </div>
          ))}

          <div className="p-4 border-t mt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Summary</h2>
            <div className="flex justify-between text-gray-700">
              <p>Subtotal:</p>
              <p>Ksh{subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-gray-700">
              <p>Shipping Fee:</p>
              <p>Ksh{shippingFee.toFixed(2)}</p>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 mt-2">
              <p>Total:</p>
              <p>Ksh{totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/orders/checkout")}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}

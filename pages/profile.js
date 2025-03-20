import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const Profiles = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user or user not logged in:", userError);
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("order_id")
      .eq("user_id", user.id);

    if (orderError) {
      console.error("Error fetching orders:", orderError);
    } else {
      setOrders(orderData);
    }
  };

  const copyToClipboard = (orderId) => {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied!");
  };

  return (
    <div className="max-w-3xl mt-28 mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {orders.map((order) => (
            <li
              key={order.order_id}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-100"
            >
              <span className="text-gray-800">{order.order_id}</span>
              <button
                onClick={() => copyToClipboard(order.order_id)}
                className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-900"
              >
                Copy
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profiles;

"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import Image from "next/image";

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const statusSteps = ["pending", "paid", "processing", "shipped", "completed"];
  const getStatusIndex = (status) => statusSteps.indexOf(status);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("order_id, status, total, shipping_address, items")
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

  const handleTrackOrder = async () => {
    setLoading(true);
    setError("");
    setOrderId("");
    setOrder(null);

    if (!orderId.trim()) {
      toast.error("Order number cannot be empty!");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (error || !data) {
      toast.error(`No order found for "${orderId}". Please check the order number.`);
    } else {
      setOrder(data);
    }

    setLoading(false);
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    if (["pending", "paid"].includes(order.status)) {
      setUpdating(true);

      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("order_id", order.order_id);

      if (error) {
        toast.error("Failed to cancel the order.");
      } else {
        setOrder((prevOrder) => ({ ...prevOrder, status: "cancelled" }));
        toast.success("Order cancelled successfully!");
      }

      setUpdating(false);
    } else {
      toast.error("Order cannot be cancelled after processing.");
    }
  };
  
  return (
    <div className="max-w-3xl mt-20 mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Order Management</h1>

      {/* Orders List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Your Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.order_id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-100">
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

      {/* Order Tracking */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Track Your Order</h2>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter your order ID"
          className="p-2 w-full border rounded mb-3"
        />
        <button
          onClick={handleTrackOrder}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Track Order"}
        </button>
      </div>

{/* Order Status Progress Bar */}
{order && (
  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
    <h3 className="text-lg font-bold mb-2">Order Status</h3>
    <div className="flex justify-between items-center max-w-lg mx-auto mt-2">
      {statusSteps.map((step, index) => (
        <div key={step} className="text-center">
          <div
            className={`w-6 h-6 rounded-full ${
              index <= getStatusIndex(order.status) ? "bg-blue-600" : "bg-gray-300"
            } mx-auto`}
          />
          <p className="text-xs">{step}</p>
        </div>
      ))}
    </div>
  </div>
)}

{/* Order Details */}
{order && (
  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
    <h2 className="text-lg font-bold mb-2">Order Details</h2>
    <p><strong>Order Number:</strong> {order.order_id}</p>
    <p><strong>Status:</strong> {order.status.toUpperCase()}</p>
    <p><strong>Total:</strong> Ksh {order.total}</p>
    <p><strong>Shipping Address:</strong> {order.shipping_address}</p>

    {/* Items */}
    <h3 className="mt-3 font-semibold">Items:</h3>
    <ul>
      {order.items && order.items.length > 0 ? (
        order.items.map((item, index) => (
          <div key={index} className="flex items-center gap-4 border-b pb-4">
          <Image src={item.image_url} width={80} height={80} className="rounded-lg" alt={item.name} />
          <div className="flex-1">
            <h3 className="text-lg font-medium">{item.name || "Name"}</h3>
            <p className="text-gray-700">Quantity: {item.quantity}</p>
            <p className="text-blue-600 font-bold">Ksh {item.price || "price"}</p>
          </div>
        </div>
        ))
      ) : (
        <li>Unable to load items.</li>
      )}
    </ul>

    {/* Cancel Order Button */}
    {order.status !== "cancelled" && (
      <button
        onClick={handleCancelOrder}
        disabled={updating}
        className="mt-4 mb-20 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        {updating ? "Cancelling..." : "Cancel Order"}
      </button>
    )}
  </div>
)}
    </div>
  );
}

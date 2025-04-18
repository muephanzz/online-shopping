"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminLayout from "@/components/AdminLayout";
import withAdminAuth from "@/components/withAdminAuth";
import Image from "next/image";

const statusSteps = ["pending", "paid", "processing", "shipped", "completed", "cancelled"];

const statusColors = {
  pending: "bg-yellow-400 text-black",
  paid: "bg-blue-400 text-white",
  processing: "bg-indigo-400 text-white",
  shipped: "bg-purple-500 text-white",
  completed: "bg-green-500 text-white",
  cancelled: "bg-red-500 text-white",
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchOrders();
  }, [filter, sortOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase.from("orders").select("*");

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    query = query.order("order_id", { ascending: sortOrder === "asc" });

    const { data, error } = await query;
    if (error) console.error("Error fetching orders:", error);
    else setOrders(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (order_id, newStatus) => {
    const validTransitions = {
      pending: ["paid", "cancelled"],
      paid: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    const currentStatus = orders.find(order => order.order_id === order_id)?.status;

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      alert(`Cannot transition from ${currentStatus} to ${newStatus}`);
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("order_id", order_id);

    if (error) alert("Error updating status: " + error.message);
    else fetchOrders();
  };

  const handleDelete = async (order_id) => {
    const confirmation = window.confirm("Are you sure you want to delete this order?");
    if (!confirmation) return;

    const { error } = await supabase.from("orders").delete().eq("order_id", order_id);
    if (error) alert("Error deleting order: " + error.message);
    else fetchOrders();
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Statuses</option>
          {statusSteps.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin blur-sm"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin"></div>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;

            return (
              <li key={order.order_id} className="border p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <p><strong>Order ID:</strong> {order.order_id}</p>
                    <p><strong>User ID:</strong> {order.user_id}</p>
                    <p><strong>Email:</strong> {order.email}</p>
                    <p><strong>Total:</strong> Ksh {order.total}</p>
                    <p><strong>Shipping:</strong> {order.shipping_address}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex justify-between items-center mt-4">
                  {statusSteps.map((step, index) => {
                    const isActive = statusSteps.indexOf(order.status) >= index;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full ${isActive ? "bg-blue-600" : "bg-gray-300"}`}></div>
                        <span className={`text-xs mt-1 ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                          {step}
                        </span>
                        {index < statusSteps.length - 1 && (
                          <div className={`w-full h-1 ${isActive ? "bg-blue-400" : "bg-gray-200"}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <h3 className="mt-4 font-semibold">Items:</h3>
                <ul className="space-y-2">
                  {items?.length > 0 ? (
                    items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 border-b pb-4">
                        <Image
                          src={item.image_url}
                          width={80}
                          height={80}
                          alt={item.name}
                          className="rounded"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-700">Qty: {item.quantity}</p>
                          <p className="text-blue-500 font-semibold">Ksh {item.price}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <li>Unable to load items.</li>
                  )}
                </ul>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {statusSteps.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(order.order_id, status)}
                      disabled={order.status === status}
                      className={`px-3 py-1 rounded text-sm 
                        ${order.status === status
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"}
                      `}
                    >
                      Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                  <button
                    onClick={() => handleDelete(order.order_id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete Order
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminLayout>
  );
};

export default withAdminAuth(ManageOrders);

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CompletedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  const OrderItems = ({ order }) => {
    const items =
      typeof order.items === "string" ? JSON.parse(order.items) : order.items;

    return (
      <ul className="mt-2 space-y-4">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <li
              key={index}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-4"
            >
              <Image
                src={item.image_url}
                width={80}
                height={80}
                className="rounded-lg"
                alt={item.name}
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium">{item.name}</h3>
                <p className="text-gray-700">Quantity: {item.quantity}</p>
                <p className="text-blue-600 font-bold">Ksh {item.price}</p>
              </div>
              <button
                onClick={() =>
                  router.push(`/upload-review/${item.product_id}`)
                }
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Write a Review
              </button>
            </li>
          ))
        ) : (
          <li>Unable to load items.</li>
        )}
      </ul>
    );
  };

  const fetchCompletedOrders = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not found:", userError);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch error:", error);
    else {
      setOrders(data);
      setFilteredOrders(data);
    }

    setLoading(false);
  };

  const handleFilter = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      const matchDate =
        (!dateRange.start || orderDate >= startDate) &&
        (!dateRange.end || orderDate <= endDate);
      const items =
        typeof order.items === "string"
          ? JSON.parse(order.items)
          : order.items;
      const matchProduct = items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchDate && (searchTerm ? matchProduct : true);
    });
    setFilteredOrders(filtered);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Order #", "Date", "Total", "Status", "Items"]],
      body: filteredOrders.map((order) => {
        const items =
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items;
        const itemNames = items.map((item) => `${item.name} (x${item.quantity})`).join(", ");
        return [
          order.order_id,
          new Date(order.created_at).toLocaleDateString(),
          `Ksh ${order.total}`,
          order.status,
          itemNames,
        ];
      }),
    });
    doc.save("completed_orders.pdf");
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchTerm, dateRange]);

  return (
    <motion.div
      className="max-w-5xl mx-auto mt-20 px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Your Completed Orders</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Search product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />
        </div>
        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download All Orders
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin blur-sm"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin"></div>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500">No completed orders found.</p>
      ) : (
        <ul className="space-y-6">
          {filteredOrders.map((order) => (
            <motion.li
              key={order.order_id}
              className="border p-4 rounded-lg shadow-md bg-white"
              whileHover={{ scale: 1.02 }}
            >
              <p>
                <strong>Order Number:</strong> {order.order_id}
              </p>
              <p>
                <strong>Order Date:</strong>{" "}
                {new Date(order.created_at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Total:</strong> Ksh {order.total}
              </p>
              <p>
                <strong>Shipping Address:</strong> {order.shipping_address}
              </p>
              <h3 className="mt-4 font-semibold">Items:</h3>
              <OrderItems order={order} />
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default CompletedOrders;

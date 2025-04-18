"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import { format } from "date-fns";

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);

  const statusSteps = ["pending", "paid", "processing", "shipped", "completed"];
  const getStatusIndex = (status) => statusSteps.indexOf(status);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return;

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("order_id, status, total, shipping_address, items")
      .eq("user_id", user.id);

    if (!orderError) setOrders(orderData);
  };

  const copyToClipboard = (orderId) => {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied!");
  };

  const handleTrackOrder = async () => {
    setLoading(true);
    setError("");
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
      toast.error(`No order found for "${orderId}"`);
    } else {
      setOrder(data);
      simulateShipmentTracking(data.status);
    }

    setLoading(false);
  };

  const handleCancelOrder = async () => {
    if (!order || !["pending", "paid"].includes(order.status)) {
      toast.error("Order cannot be cancelled after processing.");
      return;
    }

    setUpdating(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("order_id", order.order_id);

    if (!error) {
      setOrder((prev) => ({ ...prev, status: "cancelled" }));
      toast.success("Order cancelled!");
    } else {
      toast.error("Failed to cancel the order.");
    }

    setUpdating(false);
  };

  const simulateShipmentTracking = (status) => {
    if (status === "shipped" || status === "completed") {
      setTrackingInfo({
        courier: "SwiftX Delivery",
        trackingNumber: "SWX12345678KE",
        expectedArrival: "2 - 4 days",
        currentLocation: "Nairobi Dispatch Center",
      });
    } else {
      setTrackingInfo(null);
    }
  };
 
  const downloadPDF = async (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Load logo
    const logo = await fetch("/default-avatar.jpg")
      .then((res) => res.blob())
      .then((blob) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      });
  
    // Generate QR Code for Order ID
    const qrCodeData = await QRCode.toDataURL(order.order_id);
  
    // Add logo at top center
    doc.addImage(logo, "JPG", pageWidth / 2 - 15, 10, 30, 15);
  
    // Title
    doc.setFontSize(16);
    doc.setTextColor("#1E3A8A");
    doc.text("EPHANTRONICS", pageWidth / 2, 30, { align: "center" });
  
    // Subheader
    doc.setFontSize(12);
    doc.setTextColor("#374151");
    doc.text("Order Receipt", pageWidth / 2, 38, { align: "center" });
  
    // Timestamp
    doc.setFontSize(10);
    doc.setTextColor("#6B7280");
    doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`, 14, 45);
  
    // Add QR Code
    doc.addImage(qrCodeData, "PNG", pageWidth - 50, 50, 30, 30);
  
    // Order & Customer Info
    const startY = 55;
    doc.setFontSize(11);
    doc.setTextColor("#111827");
    doc.text(`Order ID: ${order.order_id}`, 14, startY);
    doc.text(`Status: ${order.status}`, 14, startY + 8);
    doc.text(`Total: Ksh ${order.total.toLocaleString()}`, 14, startY + 16);
    doc.text("Shipping Address:", 14, startY + 24);
    doc.text(`Shipping Address: ${order.shipping_address}`, 14, startY + 8);

    doc.setFontSize(11);
    doc.setTextColor("#111827");
    doc.text("Customer Details:", 14, startY + 44);
  
    doc.setFontSize(10);
    doc.setTextColor("#4B5563");
    doc.text(`Name: ${order.firt_name} " " ${order.last_name}|| "—"`, 14, startY + 52);
    doc.text(`Phone: ${order.phone_number || "—"}`, 14, startY + 68);
  
    // Items List
    const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
    if (items && items.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor("#1E3A8A");
      doc.text("Items:", 14, startY + 80);
  
      let itemY = startY + 88;
      doc.setFontSize(10);
      doc.setTextColor("#374151");
      items.forEach((item, index) => {
        const line = `${index + 1}. ${item.name} — Qty: ${item.quantity}, Price: Ksh ${item.price}`;
        doc.text(line, 14, itemY);
        itemY += 8;
      });
    }
  
    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor("#9CA3AF");
    doc.text(
      `Thank you for shopping with us — Page 1 of 1`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  
    doc.save(`Order_${order.order_id}.pdf`);
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

      {/* Order Status Progress */}
      {order && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-bold mb-2">Order Status</h3>
          <div className="flex justify-between items-center max-w-lg mx-auto mt-2">
            {statusSteps.map((step, index) => (
              <motion.div
                key={step}
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: index <= getStatusIndex(order.status) ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`w-6 h-6 rounded-full ${
                    index <= getStatusIndex(order.status) ? "bg-blue-600" : "bg-gray-300"
                  } mx-auto`}
                />
                <p className="text-xs">{step}</p>
              </motion.div>
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
          <p><strong>Estimated Delivery:</strong> Less than 2 Hours</p>

          {/* Shipment Tracking */}
          {trackingInfo && (
            <div className="mt-4 text-sm text-gray-700 border rounded-lg p-4 bg-white shadow-sm">
              <p><strong>Courier:</strong> {trackingInfo.courier}</p>
              <p><strong>Tracking Number:</strong> {trackingInfo.trackingNumber}</p>
              <p><strong>Expected Arrival:</strong> {trackingInfo.expectedArrival}</p>
              <p><strong>Current Location:</strong> {trackingInfo.currentLocation}</p>
            </div>
          )}

          {/* Items */}
          <h3 className="mt-4 font-semibold">Items:</h3>
          <ul>
            {(() => {
              const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;

              return items && items.length > 0 ? (
                items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 border-b pb-4">
                    <Image src={item.image_url} width={80} height={80} className="rounded-lg" alt={item.name} />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{item.name}</h3>
                      <p className="text-gray-700">Quantity: {item.quantity}</p>
                      <p className="text-blue-600 font-bold">Ksh {item.price}</p>
                    </div>
                  </div>
                ))
              ) : (
                <li>Unable to load items.</li>
              );
            })()}
          </ul>

          {/* PDF Download & Cancel Button */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => downloadPDF(order)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download Receipt
            </button>

            {order.status !== "cancelled" && (
              <button
                onClick={handleCancelOrder}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {updating ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

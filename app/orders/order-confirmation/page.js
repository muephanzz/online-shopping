"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

const OrderConfirmation = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching order details from localStorage or API
    const orderData = JSON.parse(localStorage.getItem("orderDetails"));
    if (!orderData) {
      router.push("/"); // Redirect to homepage if no order details found
    } else {
      setOrderDetails(orderData);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full text-center">
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Order Confirmed!</h2>
        <p className="text-gray-600 mt-2">Thank you for your purchase. Your order is now being processed.</p>

        {/* Order Details */}
        {orderDetails && (
          <div className="mt-6 text-left border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3>
            <p className="text-gray-600"><span className="font-semibold">Order ID:</span> {orderDetails.id}</p>
            <p className="text-gray-600"><span className="font-semibold">Total Paid:</span> Ksh {orderDetails.amount}</p>
            <p className="text-gray-600"><span className="font-semibold">Shipping Address:</span> {orderDetails.shipping_address}</p>
          </div>
        )}

        {/* Back to Shop Button */}
        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;

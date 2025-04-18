"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { utils, writeFile } from "xlsx";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

const CompletedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewAll, setViewAll] = useState(false); // for toggle
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const { user, setUser } = useAuth();
  const router = useRouter();

  const OrderItems = ({ order }) => {
    const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;

    return (
      <ul className="grid gap-4 mt-2">
        {items?.length > 0 ? (
          items.map((item, index) => (
            <li key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-4">
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
              {!isAdmin && (
                <Button
                  onClick={() => router.push(`/upload-review/${item.product_id}`)}
                  className="text-sm"
                >
                  Write a Review
                </Button>
              )}
            </li>
          ))
        ) : (
          <li>Unable to load items.</li>
        )}
      </ul>
    );
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, [dateRange, viewAll]);

  const fetchCompletedOrders = async () => {
    setLoading(true);
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;

    if (userError || !user) {
      console.error("Error fetching user or user not logged in:", userError);
      setLoading(false);
      return;
    }

    setUser(user);

    const { data: isAdminData, error: adminError } = await supabase.rpc("check_is_admin", {
      uid: user.id,
    });

    if (adminError) console.error("Admin check error:", adminError);
    const admin = isAdminData || false;
    setIsAdmin(admin);

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    let filteredOrders = ordersData;
    if (!admin || !viewAll) {
      filteredOrders = ordersData?.filter((order) => order.user_id === user.id);
    }

    if (ordersError) console.error("Orders fetch error:", ordersError);
    setOrders(filteredOrders || []);
    setLoading(false);
  };

  const downloadPDF = async (orders) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const logo = await fetch("/default-avatar.jpg")
      .then((res) => res.blob())
      .then((blob) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      }));

    doc.addImage(logo, "JPG", pageWidth / 2 - 15, 10, 30, 15);
    doc.setFontSize(18);
    doc.setTextColor("#1E3A8A");
    doc.text("Milimani Online Shopping", pageWidth / 2, 30, { align: "center" });
    doc.setFontSize(13);
    doc.setTextColor("#374151");
    doc.text("Completed Orders Report", pageWidth / 2, 38, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor("#6B7280");
    doc.text(`Downloaded on: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`, 14, 45);

    const tableData = await Promise.all(
      orders.map(async (order) => {
        const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        const firstItem = items?.[0] || {};
        const img = await loadImageAsBase64(firstItem.image_url);
        return [
          { content: order.order_id, rowSpan: 1 },
          format(new Date(order.created_at), "dd MMM yyyy"),
          {
            content: firstItem.name || "—",
            styles: { cellWidth: 50 }
          },
          `KSh ${order.total.toLocaleString()}`,
          order.status,
          order.shipping_address || "—",
          {
            image: img,
            width: 15,
            height: 15
          }
        ];
      })
    );

    autoTable(doc, {
      head: [["Order ID", "Date", "First Item", "Total", "Status", "Shipping", "Preview"]],
      body: tableData,
      startY: 50,
      styles: { fontSize: 10, halign: "center", valign: "middle" },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor("#9CA3AF");
        doc.text(
          `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      },
    });

    doc.save("Completed_Orders_Report.pdf");
  };

  const loadImageAsBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const downloadCSV = () => {
    const data = orders.map((order) => {
      const items = JSON.parse(order.items)
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(", ");
      return {
        OrderID: order.order_id,
        Date: order.created_at,
        Items: items,
        Total: order.total,
        Status: order.status,
        Shipping: order.shipping_address,
        Email: order.email,
        UserID: order.user_id,
      };
    });

    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Orders");
    writeFile(workbook, "completed_orders.xlsx");
  };

  return (
    <div className="max-w-5xl mx-auto sm:pt-20 pt-20 md:pt-22 lg:pt-28">
      <h1 className="text-3xl font-bold mb-4 text-center sm:text-left">
        Completed Orders
      </h1>

      {isAdmin && (
        <div className="flex gap-2 mb-4 justify-center sm:justify-start">
          <Button
            variant={!viewAll ? "default" : "outline"}
            onClick={() => setViewAll(false)}
          >
            My Orders
          </Button>
          <Button
            variant={viewAll ? "default" : "outline"}
            onClick={() => setViewAll(true)}
          >
            All Orders
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between mb-6">
        <div className="flex gap-2 flex-col sm:flex-row">
          <label className="flex flex-col text-sm">
            From:
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            To:
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="border rounded px-2 py-1"
            />
          </label>
        </div>
        {orders.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={() => downloadPDF(orders)}>Download PDF</Button>
            {isAdmin && <Button onClick={downloadCSV} variant="outline">Export CSV</Button>}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin blur-sm"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin"></div>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500">No completed orders found.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order.order_id} className="border p-4 rounded-lg shadow-sm">
              <p><strong>Order Number:</strong> {order.order_id}</p>
              <p><strong>Order Date:</strong> {format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> Ksh {order.total}</p>
              {isAdmin && (
                <div className="block">
                  <p><strong>User ID:</strong> {order.user_id}</p>
                  <p><strong>Email:</strong> {order.email}</p>  
                </div>
              )}
              <h3 className="mt-4 font-semibold">Items:</h3>
              <OrderItems order={order} />
              <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompletedOrders;

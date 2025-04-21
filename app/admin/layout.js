"use client";
import withAdminAuth from "@/components/withAdminAuth";
import Link from "next/link";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex ">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
        <Link href="/" className="block hover:text-blue-400">
            Home
          </Link>
          <Link href="/admin/products" className="block hover:text-blue-400">
            Manage Products
          </Link>
          <Link href="/admin/orders" className="block hover:text-green-400">
            Manage Orders
          </Link>
          <Link href="/admin/chat" className="block hover:text-purple-400">
            Manage Chat
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
};

export default withAdminAuth(AdminLayout);

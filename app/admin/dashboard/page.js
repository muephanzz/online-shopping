"use client";

import withAdminAuth from "@/components/withAdminAuth";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";
import { FaBox, FaShoppingCart, FaComments } from "react-icons/fa";

const cardBaseStyles =
  "p-6 rounded-2xl shadow-xl transition transform duration-300 border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 hover:scale-[1.02] hover:shadow-2xl cursor-pointer";
const iconStyles = "text-4xl";
const textStyles = "text-lg font-medium text-gray-800 transition";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <h1 className="text-4xl mt-10 mb-8 font-extrabold text-gray-900 text-center">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {/* Manage Products */}
        <Link href="/admin/products" className="group">
          <div className={cardBaseStyles}>
            <div className="flex items-center gap-4">
              <FaBox className={`${iconStyles} text-blue-600 group-hover:text-blue-700`} />
              <span className={`${textStyles} group-hover:text-blue-700`}>
                Manage Products
              </span>
            </div>
          </div>
        </Link>

        {/* Manage Orders */}
        <Link href="/admin/orders" className="group">
          <div className={cardBaseStyles}>
            <div className="flex items-center gap-4">
              <FaShoppingCart className={`${iconStyles} text-green-600 group-hover:text-green-700`} />
              <span className={`${textStyles} group-hover:text-green-700`}>
                Manage Orders
              </span>
            </div>
          </div>
        </Link>

        {/* Manage Chat */}
        <Link href="/admin/chat" className="group">
          <div className={cardBaseStyles}>
            <div className="flex items-center gap-4">
              <FaComments className={`${iconStyles} text-purple-600 group-hover:text-purple-700`} />
              <span className={`${textStyles} group-hover:text-purple-700`}>
                Manage Chat
              </span>
            </div>
          </div>
        </Link>
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminDashboard);

import withAdminAuth from "../../components/withAdminAuth";
import AdminLayout from "../../components/AdminLayout";
import Link from "next/link";
import { FaBox, FaShoppingCart, FaComments } from "react-icons/fa";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl mt-12 font-bold text-gray-800">Admin Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Manage Products */}
        <Link href="/admin/products" className="group">
          <div className="p-6 bg-white shadow-lg rounded-lg flex items-center space-x-4 border border-gray-200 transform transition duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <FaBox className="text-blue-500 text-3xl" />
            <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-500">
              Manage Products
            </span>
          </div>
        </Link>

        {/* Manage Orders */}
        <Link href="/admin/orders" className="group">
          <div className="p-6 bg-white shadow-lg rounded-lg flex items-center space-x-4 border border-gray-200 transform transition duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <FaShoppingCart className="text-green-500 text-3xl" />
            <span className="text-lg font-semibold text-gray-700 group-hover:text-green-500">
              Manage Orders
            </span>
          </div>
        </Link>

        {/* Manage Chat */}
        <Link href="/admin/chat" className="group">
          <div className="p-6 bg-white shadow-lg rounded-lg flex items-center space-x-4 border border-gray-200 transform transition duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <FaComments className="text-purple-500 text-3xl" />
            <span className="text-lg font-semibold text-gray-700 group-hover:text-purple-500">
              Manage Chat
            </span>
          </div>
        </Link>
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminDashboard);

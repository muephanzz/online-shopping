// pages/admin/index.js
import AdminLayout from "../../components/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="mt-6 space-y-4">
        <a href="/admin/products" className="text-blue-500 hover:underline">Manage Products</a>
        <a href="/admin/orders" className="text-blue-500 hover:underline">Manage Orders</a>
      </div>
    </AdminLayout>
  );
}

// pages/admin/index.js
import withAdminAuth from '../../components/withAdminAuth';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="mt-6 space-y-4">
        <Link href="/admin/products" className="text-blue-500 hover:underline">Manage Products</Link>
        <Link href="/admin/orders" className="text-blue-500 hover:underline">Manage Orders</Link>
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminDashboard);

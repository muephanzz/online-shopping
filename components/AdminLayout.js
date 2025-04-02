import Link from 'next/link';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <nav className="mb-6">
        <Link href="/admin">
          <span className="text-xl font-bold text-green-600 cursor-pointer">Admin Panel</span>
        </Link>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;

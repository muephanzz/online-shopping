import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4 text-red-600">Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <Link href="/">
        <span className="text-blue-500 hover:underline cursor-pointer mt-4">Go Back Home</span>
      </Link>
    </div>
  );
}

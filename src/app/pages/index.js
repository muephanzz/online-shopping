import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to My E-Commerce Site</h1>
        <p className="mb-4">Sign in or sign up to start shopping!</p>
        <div className="space-y-2">
          <Link href="/signin">
            <button className="bg-green-500 text-white p-2 rounded w-full">Sign In</button>
          </Link>
          <Link href="/signup">
            <button className="bg-blue-500 text-white p-2 rounded w-full">Sign Up</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

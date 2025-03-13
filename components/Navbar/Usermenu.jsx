import { useState } from 'react';
import Link from 'next/link';
import { User2 } from 'lucide-react';

export default function UserMenu({ user, onLogout, onSignIn }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="relative">
      {user ? (
        <>
          <User2
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8  h-8 text-gray-700 cursor-pointer"
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
              <p className="px-4">{user.email}</p>
              <Link href="/orders/completed" className="block px-4 py-2 hover:bg-gray-100">
                Completed Orders
              </Link>
              <button onClick={onLogout} className="w-full text-left px-4 py-2 text-red-500">
                Logout
              </button>
            </div>
          )}
        </>
      ) : (
        <div onClick={onSignIn}>
          <User2 className="flex flex-col items-center text-gray-600 hover:text-black"/>
        </div>
      )}
    </div>
  );
}

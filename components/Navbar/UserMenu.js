import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User2 } from 'lucide-react';

export default function UserMenu({ admin, user, onLogout, onSignIn }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setDropdownOpen(true)}
      onMouseLeave={() => setDropdownOpen(false)}
      ref={menuRef}
    >
      {user ? (
        <>
          <User2 className="w-8 h-8 text-gray-700 cursor-pointer transition-transform transform group-hover:scale-110" />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 transition-all duration-300 opacity-100">
              <p className="px-4 text-gray-700">{user.email}</p>
              {admin && (
                <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100">
                  Admin
                </Link>
              )}
              <Link href="/orders/completed" className="block px-4 py-2 hover:bg-gray-100">
                Completed Orders
              </Link>
              <button onClick={onLogout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </>
      ) : (
        <div onClick={onSignIn}>
          <User2 className="w-8 h-8 text-gray-600 cursor-pointer hover:text-black transition-all duration-300" />
        </div>
      )}
    </div>
  );
}

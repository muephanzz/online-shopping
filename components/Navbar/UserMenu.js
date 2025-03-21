import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import { 
  User2, LogOut, ShoppingBasket, CarTaxiFront, ListOrdered, 
  UserMinus, ChartBar, CarFront
} from "lucide-react";

export default function UserMenu({ user, setUser, onSignIn }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (user?.user_metadata?.role === "admin") {
      setIsAdmin(true);
    }
  }, [user]);

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

  // Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast.success("Logged out successfully!");
      setDropdownOpen(false);
      setUser(null);
      router.push("/"); // Redirect to home after logout
    } else {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error.message);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {user ? (
        <>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none">
            <User2 className="w-8 h-8 text-gray-700 cursor-pointer transition-transform transform hover:scale-110" />
          </button>

          {/* Dropdown Menu */}
          <div
            className={`absolute right-0 mt-4 w-56 bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 
            ${dropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
          >
            <p className="px-4 py-2 bg-gray-100 text-gray-700 font-medium">
              {user?.user_metadata?.first_name ? `Hi, ${user.user_metadata.first_name}` : user?.email || "User"}
            </p>
            {isAdmin && (
              <>
                <Link href="/admin" className="dropdown-item"><UserMinus /> Admin Panel</Link>
                <Link href="/admin/chats" className="dropdown-item"><ChartBar /> Manage Chats</Link>
                <Link href="/admin/orders" className="dropdown-item"><CarFront /> Manage Orders</Link>
                <Link href="/admin/products" className="dropdown-item"><ShoppingBasket /> Manage Products</Link>
              </>
            )}
            <Link href="/profile" className="dropdown-item"><User2 /> Update Profile</Link>
            <Link href="/orders/order-tracking" className="dropdown-item"><CarTaxiFront /> Track Order</Link>
            <Link href="/orders/completed" className="dropdown-item"><ListOrdered /> Completed Orders</Link>
            <button onClick={handleLogout} className="dropdown-item text-red-500"><LogOut /> Logout</button>
          </div>
        </>
      ) : (
        <button onClick={onSignIn} className="focus:outline-none">
          <User2 className="w-8 h-8 text-gray-600 cursor-pointer hover:text-black transition-all duration-300" />
        </button>
      )}
    </div>
  );
}

// Tailwind CSS Styles
const styles = `
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    color: #4a5568;
    transition: background 0.2s ease-in-out;
  }
  .dropdown-item:hover {
    background: #f3f4f6;
    color: #1a202c;
  }
`;

export { styles };

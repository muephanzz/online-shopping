import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import { User2, LogOut, ShoppingBasket, ChevronDown, LogIn, Package, User, CheckCircle } from "lucide-react";

export default function UserMenu({ user, setUser, onSignIn }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    // Fetch current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user or user not logged in:", userError);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) console.error("Error fetching profile:", error);
    else setProfile(data || {});

    setLoading(false);
  };

    useEffect(() => {
        if (user?.user_metadata?.role === "admin") {
            setIsAdmin(true);
        }
    }, [user]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            toast.success("Logged out successfully!");
            setUser(null);
            router.push("/");
        } else {
            toast.error("Logout failed. Please try again.");
        }
    };

    return (
        <div className="relative">
            {user ? (
                <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="flex items-center p-2 text-white rounded-full hover:bg-white hover:text-black transition">
                        <User2 className="h-6 w-6" />
                        <ChevronDown className="h-4 w-4 ml-1" />
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    > 
                        <Menu.Items className="absolute right-0 mt-3 w-56 bg-white border rounded-md shadow-lg">
                        {profile && (
                            <div className="px-4 py-2 text-white bg-gray-500 rounded-md font-medium">
                               Hello, <span className="font-bold text-orange-500">{profile.first_name}</span>
                            </div>
                            )}
                            {isAdmin && (
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link href="/admin" className={`block px-4 py-2 ${active ? "bg-gray-100" : ""}`}>
                                            <ShoppingBasket className="inline-block mr-2" /> Admin Panel
                                        </Link>
                                    )}
                                </Menu.Item>
                            )}
                            <Menu.Item>
                                {({ active }) => (
                                    <Link href="/profile" className={`block px-4 py-2 ${active ? "bg-gray-100" : ""}`}>
                                        <User className="inline-block mr-2" /> Profile
                                    </Link>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <Link href="/orders/order-tracking" className={`block px-4 py-2 ${active ? "bg-gray-100" : ""}`}>
                                        <Package className="inline-block mr-2" /> Order Tracking
                                    </Link>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <Link href="/orders/completed" className={`block px-4 py-2 ${active ? "bg-gray-100" : ""}`}>
                                        <CheckCircle className="inline-block mr-2" /> Completed Orders
                                    </Link>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button onClick={handleLogout} className={`block w-full text-left px-4 py-2 text-red-500 ${active ? "bg-red-50" : ""}`}>
                                        <LogOut className="inline-block mr-2" /> Logout
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            ) : (
                <button onClick={onSignIn} className="bg-green-600 text-white rounded-md w-16 hover:bg-white hover:text-black transition">
                   Sign In
                </button>
            )}
        </div>
    );
}

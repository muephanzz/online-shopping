import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DesktopMenu() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) console.error('Error fetching categories:', error);
      else setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <nav className="absolute p-0 bg-blue-200 shadow-md hidden md:flex space-x-6 mt-28 w-full text-lg">
      {[
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
      ].map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`hover:text-blue-500 transition duration-300 ${
            router.pathname === item.path ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-700"
          }`}
        >
          {item.name}
        </Link>
      ))}

      {categories.map((category) => {
        const isActive = router.query.category_id == category.id;
        return (
          <Link
            key={category.id}
            href={`/products?category_id=${category.id}`}
            className={`hover:text-blue-500 transition duration-300 ${
              isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-700"
            }`}
          >
            {category.category}
          </Link>
        );
      })}
    </nav>
  );
}

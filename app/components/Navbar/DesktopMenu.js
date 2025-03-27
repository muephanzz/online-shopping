"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DesktopMenu() {
  const searchParams = useSearchParams(); // Get URL search parameters
  const categoryId = searchParams.get("category_id"); // Extract category_id
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) console.error("Error fetching categories:", error);
      else setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <nav className="absolute shadow-md hidden md:flex space-x-6 mt-28 w-full text-lg">
      <Link
        href="/"
        className="hover:text-blue-500 transition duration-300 text-gray-700"
      >
        Home
      </Link>

      {categories?.map((category) => {
        const isActive = categoryId === category.id.toString(); // Ensure comparison is valid
        return (
          <Link
            key={category.id}
            href={`/products?category_id=${category.id}`}
            className={`hover:text-blue-500 transition duration-300 ${
              isActive
                ? "text-blue-600 font-bold border-b-2 border-blue-600"
                : "text-gray-700"
            }`}
          >
            {category.category}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

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
    <nav className="absolute bg-gradient-to-r from-orange-100 to-yellow-50 shadow-md hidden md:flex space-x-6 mt-28 w-full text-lg space-x-4 overflow-x-auto py-1 px-4 mb-4">
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

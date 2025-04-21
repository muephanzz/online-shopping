"use client";
import Link from "next/link";
import { Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Category = {
  id: string;
  category: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (!error) setCategories(data || []);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Shop by Category</h1>

      {loading ? (
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mt-10" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category_id=${category.id}`}
              className="flex items-center py-4 px-5 bg-orange-100 text-gray-800 font-semibold rounded-xl shadow hover:bg-orange-600 hover:text-white transition"
            >
              <Tag size={20} className="mr-3" />
              {category.category}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

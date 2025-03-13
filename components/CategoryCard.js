import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CategoryCard({ category }) {
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
    <nav className="absolute hidden md:flex space-x-6 mt-28 pl-4 text-lg">
    
    {categories.map((category) => (
        <Link
            key={category.id}
            href={`/products?category_id=${category.id}`}
            className="hover:text-blue-500"
            >
            {category.category}
        </Link>
     ))}
    </nav>
  );
}

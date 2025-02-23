import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <div>
      <h1>Shop by Category</h1>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <a href={`/categories/${category.name.toLowerCase()}`}>
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesPage;

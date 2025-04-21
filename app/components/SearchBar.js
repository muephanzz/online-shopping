'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('name, product_id')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (!error) setSuggestions(data);
    };

    const timeoutId = setTimeout(fetchSuggestions, 300); // debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products/search?query=${query}`);
      setQuery('');
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name) => {
    router.push(`/products/search?query=${name}`);
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full pr-4">
      <form onSubmit={handleSubmit} className="relative w-full mx-2">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-500" size={20} />
      </form>

      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white shadow-lg w-full mt-1 rounded-md border max-h-48 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.product_id}
              onClick={() => handleSuggestionClick(item.name)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

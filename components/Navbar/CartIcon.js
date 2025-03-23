import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartIcon({ cartCount }) {
  return (
    <div className="relative text-white hover:bg-white hover:text-black rounded-full">
      <Link href="/cart">
        <ShoppingCart className="flex flex-col items-center" />
      </Link>
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
          {cartCount}
        </span>
      )}
    </div>
  );
}

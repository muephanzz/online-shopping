import Link from 'next/link';
import CategoryCard from "../../components/CategoryCard";


export default function DesktopMenu() {


  return (
    <nav className="absolute hidden md:flex space-x-6 mt-28 pl-4 text-lg">
      <Link href="/categories">Categories</Link>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/contact">Contact</Link>
    </nav>
  );
}
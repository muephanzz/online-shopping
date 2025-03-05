import Link from 'next/link';

export default function DesktopMenu() {
  return (
    <div className="hidden md:flex space-x-6 mt-4 pl-4 text-lg">
      {['Home', 'Smartphones', 'Laptops', 'Woofers', 'Amplifiers', 'About', 'Contact'].map((item) => (
        <Link key={item} href={`#${item.toLowerCase()}`}>
          {item}
        </Link>
      ))}
    </div>
  );
}

import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/">
      <h1 className="text-2xl font-bold text-blue-600 pl-4 hidden md:block">Ephantronics</h1>
    </Link>
  );
}

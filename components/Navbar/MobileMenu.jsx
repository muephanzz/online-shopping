import { Menu, X } from 'lucide-react';

export default function MobileMenu({ menuOpen, setMenuOpen }) {
  return (
    <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
      {menuOpen ? <X /> : <Menu />}
    </button>
  );
}

"use Client";
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
        <div className="md:hidden mr-6">
          <button onClick={toggleMenu} className="fixed top-6 ">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
)}
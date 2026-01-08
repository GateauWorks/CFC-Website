"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/register", label: "Register" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="flex flex-col items-center mb-16 md:mb-20 mt-8 md:mt-12">
      <div className="flex items-center justify-center w-full relative">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight flex items-center">
          <Link 
            href="/"
            className="text-gray-900 hover:text-green-600 transition-colors duration-200"
          >
            Convoy for a Cause
          </Link>
          <span className="text-green-600 ml-1">.</span>
        </h2>
        {/* Hamburger button for mobile */}
        <button
          className="md:hidden p-2 ml-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 absolute right-0 transition-colors"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
      {/* Desktop nav centered below title */}
      <nav className="hidden md:flex flex-row gap-2 mt-4 justify-center w-full">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive(link.href)
                ? "text-green-600 bg-green-50 shadow-sm"
                : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {/* Mobile nav below title */}
      <nav
        className={`flex-col gap-1 mt-4 ${
          menuOpen ? "flex" : "hidden"
        } md:hidden w-full border-t border-gray-200 pt-4`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive(link.href)
                ? "text-green-600 bg-green-50 shadow-sm"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;

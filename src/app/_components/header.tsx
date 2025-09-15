
"use client";
import Link from "next/link";


import { useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = { name: "User", picture: "/profile.jpg" };

  return (
    <header className="flex flex-col items-center mb-20 mt-8">
      <div className="flex items-center justify-center w-full relative">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight flex items-center">
          <Link href="/">
            Convoy for a Cause
          </Link>
          .
        </h2>
        {/* Hamburger button for mobile */}
        <button
          className="md:hidden p-2 ml-2 rounded focus:outline-none focus:ring-2 focus:ring-green-700 absolute right-0"
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="block w-6 h-0.5 bg-green-900 mb-1"></span>
          <span className="block w-6 h-0.5 bg-green-900 mb-1"></span>
          <span className="block w-6 h-0.5 bg-green-900"></span>
        </button>
      </div>
      {/* Desktop nav centered below title */}
      <nav
        className={`hidden md:flex flex-row gap-4 mt-2 justify-center w-full`}
      >
        <Link href="/about" legacyBehavior passHref>
          <a className="px-4 py-2 rounded hover:underline transition">About</a>
        </Link>
        <Link href="/events" legacyBehavior passHref>
          <a className="px-4 py-2 rounded hover:underline transition">Events</a>
        </Link>
        <Link href="/register" legacyBehavior passHref>
          <a className="px-4 py-2 rounded hover:underline transition">Register</a>
        </Link>
      </nav>
      {/* Mobile nav below title */}
      <nav
        className={`flex-col gap-4 mt-4 ${menuOpen ? 'flex' : 'hidden'} md:hidden w-full`}
      >
        <Link href="/about" legacyBehavior passHref>
          <a className="px-4 py-2 rounded hover:underline transition">About</a>
        </Link>
        <Link href="/events" legacyBehavior passHref>
          <a className="px-4 py-2 rounded hover:underline transition">Events</a>
        </Link>
        <Link href="/register" legacyBehavior passHref>
          <a className="px-4 py-2 rounded hover:underline transition">Register</a>
        </Link>
      </nav>
    </header>
  );
};

export default Header;

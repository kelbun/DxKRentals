"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/cars", label: "Fleet" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-surface/95 backdrop-blur-lg border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-gold to-goldSoft rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">P</span>
          </div>
          <span className="font-serif font-bold text-lg tracking-tight">
            <span className="text-gold">DxK</span><span className="text-white"> RENTALS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm transition-colors duration-200 pb-0.5",
                pathname === href
                  ? "text-gold border-b border-gold font-semibold"
                  : "text-muted hover:text-white"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-muted hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-gold to-goldSoft text-black text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-muted"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-border px-6 py-4 flex flex-col gap-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-muted hover:text-white"
            >
              {label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleSignOut} className="text-sm text-muted text-left">
              Sign Out
            </button>
          ) : (
            <Link href="/signup" className="text-gold font-semibold text-sm">
              Get Started →
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

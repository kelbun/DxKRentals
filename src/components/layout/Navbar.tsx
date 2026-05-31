"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
          ? "bg-[#070707]/95 backdrop-blur-lg border-b border-[#1F1F1F]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          {/* Logo image — replace logo.png with your actual logo file in /public */}
          <div className="w-9 h-9 relative flex-shrink-0">
            <Image
              src="/logo.png"
              alt="DxK Rentals Logo"
              fill
              className="object-contain"
              onError={(e) => {
                // Fallback if logo not uploaded yet
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div style="width:36px;height:36px;background:linear-gradient(135deg,#D4AF37,#C6A55A);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:#000">D</div>`;
                }
              }}
            />
          </div>
          <span style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            className="font-bold text-xl tracking-tight">
            <span className="text-[#D4AF37]">DxK</span>
            <span className="text-white"> RENTALS</span>
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
                  ? "text-[#D4AF37] border-b border-[#D4AF37] font-semibold"
                  : "text-[#71717A] hover:text-white"
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
              <Link href="/dashboard" className="text-sm text-[#71717A] hover:text-white transition-colors">
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="text-sm text-[#71717A] hover:text-white transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[#71717A] hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-[#71717A]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Gold accent line under navbar */}
      <div style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)"
      }} />

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#101010] border-t border-[#1F1F1F] px-6 py-4 flex flex-col gap-4">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="text-sm text-[#71717A] hover:text-white">
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-[#71717A]">Dashboard</Link>
              <button onClick={handleSignOut} className="text-sm text-[#71717A] text-left">Sign Out</button>
            </>
          ) : (
            <Link href="/signup" className="text-[#D4AF37] font-semibold text-sm">Get Started →</Link>
          )}
        </div>
      )}
    </header>
  );
}

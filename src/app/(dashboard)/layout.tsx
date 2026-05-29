import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth/getUser";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const adminLinks = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/cars", label: "Fleet" },
    { href: "/dashboard/revenue", label: "Analytics" },
    { href: "/dashboard/calendar", label: "Calendar" },
  ];

  const customerLinks = [
    { href: "/dashboard", label: "My Bookings" },
  ];

  const links = user.role === "admin" || user.role === "partner" ? adminLinks : customerLinks;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 bg-surface border-r border-border flex flex-col py-6">
        <Link href="/" className="px-6 mb-8 block">
          <span className="font-serif font-bold text-base">
            <span className="text-gold">DxK</span><span className="text-white"> RENTALS</span>
          </span>
          <p className="text-muted text-xs mt-0.5 uppercase tracking-wider">
            {user.role} portal
          </p>
        </Link>
        <nav className="flex flex-col">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-6 py-3 text-sm text-muted hover:text-white hover:bg-surface2 transition-colors border-l-2 border-transparent hover:border-gold/50"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-6 pt-6 border-t border-border">
          <p className="text-muted text-xs">Signed in as</p>
          <p className="text-white text-sm font-semibold mt-0.5 truncate">{user.full_name || user.email}</p>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

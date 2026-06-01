import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth/getUser";
import LogoutButton from "@/components/layout/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const adminLinks = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/cars", label: "Fleet" },
    { href: "/dashboard/revenue", label: "Analytics" },
    { href: "/dashboard/calendar", label: "Calendar" },
    { href: "/dashboard/documents", label: "Documents" },
  ];

  const customerLinks = [
    { href: "/dashboard", label: "My Bookings" },
  ];

  const links =
    user.role === "admin" || user.role === "partner"
      ? adminLinks
      : customerLinks;

  return (
    <div className="min-h-screen bg-[#070707] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#101010] border-r border-[#1F1F1F] flex flex-col py-6 flex-shrink-0">
        <Link href="/" className="px-6 mb-8 block">
          <span
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            className="font-bold text-base"
          >
            <span className="text-[#D4AF37]">DxK</span>
            <span className="text-white"> RENTALS</span>
          </span>
          <p className="text-[#71717A] text-xs mt-0.5 uppercase tracking-wider">
            {user.role} portal
          </p>
        </Link>

        <nav className="flex flex-col flex-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-6 py-3 text-sm text-[#71717A] hover:text-white hover:bg-[#161616] transition-colors border-l-2 border-transparent hover:border-[rgba(212,175,55,0.5)]"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-6 pt-4 border-t border-[#1F1F1F]">
          <p className="text-[#71717A] text-xs">Signed in as</p>
          <p className="text-white text-sm font-semibold mt-0.5 truncate">
            {user.full_name || user.email}
          </p>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

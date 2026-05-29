import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="font-serif font-bold text-xl mb-3">
              <span className="text-gold">DxK</span><span className="text-white"> RENTALS</span>
            </div>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              Premium luxury vehicle rentals. Curated for those who demand
              nothing short of extraordinary.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              className="inline-flex items-center gap-2 mt-4 text-sm text-[#25D366] hover:opacity-80 transition-opacity"
            >
              <span>💬</span> WhatsApp Us
            </a>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Fleet
            </h3>
            <div className="flex flex-col gap-2">
              {["All Vehicles", "Supercars", "SUVs", "Luxury Saloons"].map((l) => (
                <Link key={l} href="/cars" className="text-muted text-sm hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Company
            </h3>
            <div className="flex flex-col gap-2">
              {[
                ["About", "/about"],
                ["Contact", "/contact"],
                ["Terms", "/terms"],
                ["Privacy", "/privacy"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="text-muted text-sm hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs">© 2025 DxK Rentals. All rights reserved.</p>
          <p className="text-muted text-xs">Luxury Car Rentals — United Kingdom</p>
        </div>
      </div>
    </footer>
  );
}

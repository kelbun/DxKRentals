import Link from "next/link";

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "447000000000";

  return (
    <footer className="bg-[#070707] border-t border-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
              className="font-bold text-xl mb-3">
              <span className="text-[#D4AF37]">DxK</span>
              <span className="text-white"> RENTALS</span>
            </div>
            <p className="text-[#71717A] text-sm leading-relaxed max-w-xs">
              Premium luxury car rentals. Curated for those who demand nothing short of extraordinary.
            </p>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-[#25D366] hover:opacity-80 transition-opacity"
            >
              <span>💬</span> WhatsApp Us
            </a>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Fleet</h3>
            <div className="flex flex-col gap-2">
              {["All Vehicles", "Supercars", "SUVs", "Luxury Saloons"].map((l) => (
                <Link key={l} href="/cars"
                  className="text-[#71717A] text-sm hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Company</h3>
            <div className="flex flex-col gap-2">
              {[
                ["About", "/about"],
                ["Contact", "/contact"],
                ["Terms", "/terms"],
                ["Privacy", "/privacy"],
              ].map(([label, href]) => (
                <Link key={href} href={href}
                  className="text-[#71717A] text-sm hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        {/* Gold divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)", marginBottom: "24px" }} />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#71717A] text-xs">© 2025 DxK Rentals. All rights reserved.</p>
          <p className="text-[#71717A] text-xs">Premium Luxury Vehicle Rentals — United Kingdom</p>
        </div>
      </div>
    </footer>
  );
}

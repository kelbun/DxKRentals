import Link from "next/link";
import { getCars } from "@/services/cars";
import CarCard from "@/components/cards/CarCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default async function HomePage() {
  const featuredCars = await getCars({ featured: true }).catch(() => []);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative min-h-screen bg-background flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-gold/8 via-transparent to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 border border-[rgba(212,175,55,0.25)] bg-gold/5 rounded-full px-4 py-2 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_#D4AF37]" />
                <span className="text-gold text-xs font-semibold tracking-[0.15em] uppercase">
                  Premium Fleet Available
                </span>
              </div>
              <h1 className="font-serif font-bold text-5xl md:text-7xl leading-[0.95] tracking-[-0.04em] text-white mb-6">
                Drive<br />
                <span className="text-gold">Prestige.</span><br />
                <span className="font-light italic">Live the Legend.</span>
              </h1>
              <p className="text-muted text-lg leading-relaxed max-w-md mb-10">
                Access the world's most coveted automobiles. Curated for those
                who demand nothing short of extraordinary.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/cars"
                  className="bg-gradient-to-r from-gold to-goldSoft text-black font-bold text-sm px-8 py-3.5 rounded-full shadow-lg shadow-gold/25 hover:opacity-90 transition-opacity"
                >
                  Browse Fleet
                </Link>
                <Link
                  href="/contact"
                  className="bg-transparent text-white font-semibold text-sm px-8 py-3.5 rounded-full border border-[rgba(212,175,55,0.25)] hover:border-gold/50 transition-colors backdrop-blur-sm"
                >
                  Contact Us
                </Link>
              </div>
              <div className="flex gap-10 mt-14 pt-8 border-t border-border">
                {[["Premium", "Fleet"], ["Flexible", "Bookings"], ["5★", "Service"]].map(([v, l]) => (
                  <div key={l}>
                    <div className="text-[#D4AF37] font-serif font-extrabold text-xl">{v}</div>
                    <div className="text-[#71717A] text-xs mt-1 tracking-widest uppercase">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        {featuredCars.length > 0 && (
          <section className="bg-surface py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-gold text-xs tracking-[0.2em] uppercase mb-3">Our Collection</p>
                <h2 className="font-serif font-bold text-4xl md:text-5xl text-white tracking-tight">
                  Featured Vehicles
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCars.slice(0, 6).map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  href="/cars"
                  className="inline-flex items-center gap-2 text-gold border border-[rgba(212,175,55,0.25)] px-8 py-3 rounded-full text-sm font-semibold hover:border-gold/50 transition-colors"
                >
                  View Full Fleet →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Why Us */}
        <section className="bg-background py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-gold text-xs tracking-[0.2em] uppercase mb-3">Why Choose Us</p>
              <h2 className="font-serif font-bold text-4xl md:text-5xl text-white tracking-tight">
                The Pinnacle of Automotive Experience
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "◆", title: "Curated Fleet", desc: "Handpicked ultra-luxury vehicles maintained to showroom standards." },
                { icon: "◈", title: "Concierge Service", desc: "White-glove delivery and collection at your preferred location." },
                { icon: "◉", title: "Verified Cars", desc: "Every vehicle independently certified and rigorously inspected." },
                { icon: "◎", title: "Flexible Terms", desc: "Daily, weekend, and extended rental packages tailored to you." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-surface2 border border-[rgba(212,175,55,0.15)] rounded-2xl p-7">
                  <div className="text-gold text-2xl mb-4">{icon}</div>
                  <h3 className="text-white font-serif font-bold text-base mb-2">{title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface py-20 px-6 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-gold/6 to-gold/2 border border-[rgba(212,175,55,0.2)] rounded-3xl p-14">
              <h2 className="font-serif font-bold text-4xl text-white mb-4 tracking-tight">
                Ready to Drive in Style?
              </h2>
              <p className="text-muted text-base leading-relaxed mb-10">
                Reserve your vehicle today. Our team is available around the
                clock to ensure your experience is flawless.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link
                  href="/cars"
                  className="bg-gradient-to-r from-gold to-goldSoft text-black font-bold text-sm px-9 py-3.5 rounded-full hover:opacity-90 transition-opacity"
                >
                  Reserve Now
                </Link>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "447000000000"}`}
                  className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-[#25D366]/20 transition-colors"
                >
                  <span>💬</span> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

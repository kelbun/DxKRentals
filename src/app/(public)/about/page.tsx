import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#070707] min-h-screen pt-24">
        {/* Hero */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,175,55,0.08), transparent 70%)" }}
          />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-4">About Us</p>
            <h1 className="font-serif font-bold text-5xl md:text-6xl text-white tracking-tight mb-6">
              Redefining Luxury<br />Car Rentals
            </h1>
            <p className="text-[#71717A] text-lg leading-relaxed max-w-2xl mx-auto">
              DxK Rentals was founded with one mission — to give everyone access to the
              world's most extraordinary vehicles. We believe driving should be an
              experience, not just a journey.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 px-6 border-t border-[#1F1F1F]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-4">Our Story</p>
              <h2 className="font-serif font-bold text-4xl text-white mb-6 tracking-tight">
                Born from a Passion for Exceptional Cars
              </h2>
              <p className="text-[#71717A] leading-relaxed mb-4">
                What started as a passion project quickly became one of the most trusted
                luxury car rental services in the UK. We handpick every vehicle in our
                fleet, ensuring each one meets our uncompromising standards.
              </p>
              <p className="text-[#71717A] leading-relaxed">
                Every car is meticulously maintained, professionally valeted, and delivered
                to your door — because the experience starts before you even turn the key.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "5+", label: "Premium Vehicles" },
                { value: "Many", label: "Happy Customers" },
                { value: "4.9★", label: "Average Rating" },
                { value: "24/7", label: "Customer Support" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6 text-center">
                  <p className="font-serif font-extrabold text-3xl text-[#D4AF37] mb-2">{value}</p>
                  <p className="text-[#71717A] text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6 bg-[#101010] border-t border-[#1F1F1F]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-4">What We Stand For</p>
              <h2 className="font-serif font-bold text-4xl text-white tracking-tight">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "◆",
                  title: "Uncompromising Quality",
                  desc: "Every vehicle undergoes rigorous inspection before it joins our fleet. We accept nothing less than perfection."
                },
                {
                  icon: "◈",
                  title: "White-Glove Service",
                  desc: "From first enquiry to vehicle return, we provide concierge-level service tailored to your needs."
                },
                {
                  icon: "◉",
                  title: "Complete Transparency",
                  desc: "No hidden fees, no surprises. Clear pricing and honest communication — always."
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-8">
                  <div className="text-[#D4AF37] text-3xl mb-5">{icon}</div>
                  <h3 className="text-white font-serif font-bold text-lg mb-3">{title}</h3>
                  <p className="text-[#71717A] text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 border-t border-[#1F1F1F]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif font-bold text-4xl text-white mb-4 tracking-tight">
              Ready to Experience DxK?
            </h2>
            <p className="text-[#71717A] mb-8">
              Browse our fleet and reserve your vehicle today.
            </p>
            <a
              href="/cars"
              className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black font-bold px-10 py-3.5 rounded-full hover:opacity-90 transition-opacity"
            >
              Browse Fleet
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#070707] min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-4">Legal</p>
          <h1 className="font-serif font-bold text-5xl text-white tracking-tight mb-4">Terms & Conditions</h1>
          <p className="text-[#71717A] text-sm mb-12">Last updated: January 2025</p>

          {[
            {
              title: "1. Rental Agreement",
              body: "By submitting a booking request with DxK Rentals, you agree to these terms and conditions in full. A binding rental agreement is formed when DxK Rentals confirms your booking in writing."
            },
            {
              title: "2. Eligibility",
              body: "Drivers must be at least 25 years of age and hold a full, valid driving licence that has been held for a minimum of 2 years. An international driving permit may be required for non-UK licence holders."
            },
            {
              title: "3. Payment",
              body: "All rentals require a security deposit which will be confirmed at the time of booking. Full payment is due prior to vehicle collection or delivery. We accept bank transfer and cash. No online payment is processed through this website."
            },
            {
              title: "4. Vehicle Use",
              body: "Vehicles must only be driven by the named, approved driver(s). Vehicles must not be used for racing, off-road driving, or any illegal activity. Smoking is strictly prohibited in all vehicles."
            },
            {
              title: "5. Insurance",
              body: "All vehicles are comprehensively insured. The renter is responsible for any excess applicable in the event of an accident, theft, or damage. Additional insurance products may be available upon request."
            },
            {
              title: "6. Cancellations",
              body: "Cancellations made more than 72 hours before the rental start date will receive a full refund of any deposit paid. Cancellations within 72 hours may forfeit the deposit. DxK Rentals reserves the right to cancel any booking at its discretion."
            },
            {
              title: "7. Damage & Liability",
              body: "The renter is liable for all damage to the vehicle during the rental period, including any damage caused by third parties while the vehicle is in the renter's care. All damage must be reported immediately."
            },
            {
              title: "8. Fuel Policy",
              body: "Vehicles are provided with a full tank of fuel and must be returned with a full tank. Failure to do so will result in a refuelling charge plus an administration fee."
            },
            {
              title: "9. Late Returns",
              body: "Vehicles returned later than the agreed time without prior notice will incur additional daily rental charges at the standard rate."
            },
            {
              title: "10. Governing Law",
              body: "These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales."
            },
          ].map(({ title, body }) => (
            <div key={title} className="mb-8 pb-8 border-b border-[#1F1F1F] last:border-0">
              <h2 className="text-white font-bold text-lg mb-3">{title}</h2>
              <p className="text-[#71717A] leading-relaxed text-sm">{body}</p>
            </div>
          ))}

          <div className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6 mt-8">
            <p className="text-[#71717A] text-sm">
              Questions about our terms? Contact us at{" "}
              <a href="mailto:hello@dxkrentals.com" className="text-[#D4AF37] hover:underline">
                hello@dxkrentals.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

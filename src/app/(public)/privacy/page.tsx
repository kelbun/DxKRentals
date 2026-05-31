import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#070707] min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-4">Legal</p>
          <h1 className="font-serif font-bold text-5xl text-white tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-[#71717A] text-sm mb-12">Last updated: January 2025</p>

          {[
            {
              title: "1. Information We Collect",
              body: "We collect information you provide when creating an account or submitting a booking — including your name, email address, phone number, and driving licence details. We also collect usage data to improve our service."
            },
            {
              title: "2. How We Use Your Information",
              body: "Your information is used to process booking requests, verify your identity, communicate with you about your rental, and improve our services. We do not sell your personal data to third parties."
            },
            {
              title: "3. Data Storage",
              body: "Your data is stored securely using Supabase, a GDPR-compliant cloud database provider. All data is encrypted in transit and at rest."
            },
            {
              title: "4. Cookies",
              body: "We use essential cookies to maintain your login session. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, though this may affect site functionality."
            },
            {
              title: "5. Your Rights",
              body: "Under GDPR, you have the right to access, correct, or delete your personal data at any time. You may also request a copy of all data we hold about you. To exercise these rights, contact us at hello@dxkrentals.com."
            },
            {
              title: "6. Data Retention",
              body: "We retain your personal data for as long as your account is active or as required by law. Booking records are kept for a minimum of 6 years for legal and accounting purposes."
            },
            {
              title: "7. Third Parties",
              body: "We may share limited data with third-party service providers strictly necessary to operate our service (such as authentication providers). These providers are bound by their own privacy policies and GDPR obligations."
            },
            {
              title: "8. Contact",
              body: "For any privacy-related queries, please contact us at hello@dxkrentals.com. We aim to respond within 72 hours."
            },
          ].map(({ title, body }) => (
            <div key={title} className="mb-8 pb-8 border-b border-[#1F1F1F] last:border-0">
              <h2 className="text-white font-bold text-lg mb-3">{title}</h2>
              <p className="text-[#71717A] leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

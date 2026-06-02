import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import Link from "next/link";

// TO DISABLE COMING SOON: delete this file or comment out the redirect in middleware.ts
export default async function ComingSoonPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/coming-soon");

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,175,55,0.07), transparent 70%)" }} />

      <div className="relative z-10 text-center max-w-xl">
        {/* Logo */}
        <div style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          className="font-bold text-2xl mb-12">
          <span className="text-[#D4AF37]">DxK</span>
          <span className="text-white"> RENTALS</span>
        </div>

        {/* Gold divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", marginBottom: 48 }} />

        <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-6">
          Launching Soon
        </p>

        <h1 className="font-serif font-bold text-5xl md:text-6xl text-white tracking-tight mb-6 leading-tight">
          Something<br />
          <span className="text-[#D4AF37]">Extraordinary</span><br />
          Is Coming
        </h1>

        <p className="text-[#71717A] text-lg leading-relaxed mb-10">
          DxK Rentals is putting the finishing touches on an exceptional fleet of
          premium vehicles. Be the first to know when we launch.
        </p>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "447000000000"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] px-8 py-4 rounded-full font-semibold text-sm hover:bg-[#25D366]/20 transition-colors mb-6"
        >
          <span>💬</span> Get Notified on WhatsApp
        </a>

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)", margin: "32px 0" }} />

        <p className="text-[#71717A] text-xs">
          Signed in as <span className="text-white">{user.email}</span> ·{" "}
          <Link href="/" className="text-[#D4AF37] hover:underline">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

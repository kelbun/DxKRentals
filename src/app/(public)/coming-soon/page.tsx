import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import Link from "next/link";

export default async function ComingSoonPage() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,175,55,0.07), transparent 70%)" }} />
      <div className="relative z-10 text-center max-w-xl">
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="font-bold text-2xl mb-12">
          <span className="text-[#D4AF37]">DxK</span><span className="text-white"> RENTALS</span>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", marginBottom: 48 }} />
        <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-6">Launching Soon</p>
        <h1 className="font-serif font-bold text-5xl md:text-6xl text-white tracking-tight mb-6 leading-tight">
          Something<br /><span className="text-[#D4AF37]">Extraordinary</span><br />Is Coming
        </h1>
        <p className="text-[#71717A] text-lg leading-relaxed mb-10">
          DxK Rentals is putting the finishing touches on an exceptional fleet of premium vehicles. Be the first to know when we launch.
        </p>
        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "447000000000"}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] px-8 py-4 rounded-full font-semibold text-sm hover:bg-[#25D366]/20 transition-colors mb-8">
          <span>💬</span> Get Notified on WhatsApp
        </a>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)", margin: "32px 0" }} />
        <div className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-xl p-4 text-left">
          <p className="text-[#D4AF37] text-xs font-semibold mb-1">Admin view — you are logged in as admin</p>
          <p className="text-[#71717A] text-xs leading-relaxed">To remove this page when ready to launch, delete the <code className="text-white bg-[#0D0D0D] px-1.5 py-0.5 rounded">src/app/(public)/coming-soon</code> folder and push to GitHub.</p>
          <div className="flex gap-4 mt-3">
            <Link href="/" className="text-[#D4AF37] text-xs hover:underline">Back to site</Link>
            <Link href="/dashboard" className="text-[#D4AF37] text-xs hover:underline">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

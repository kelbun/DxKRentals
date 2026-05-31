"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e: any) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "447000000000";
  const ic = "w-full bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#3f3f46] focus:outline-none focus:border-[#D4AF37]/60 transition-colors";
  const lc = "block text-xs text-[#71717A] uppercase tracking-wider mb-1.5 font-medium";

  return (
    <>
      <Navbar />
      <main className="bg-[#070707] min-h-screen pt-24">
        {/* Hero */}
        <section className="py-20 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(212,175,55,0.07), transparent 70%)" }}
          />
          <div className="relative z-10">
            <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-4">Get In Touch</p>
            <h1 className="font-serif font-bold text-5xl md:text-6xl text-white tracking-tight mb-4">
              Contact Us
            </h1>
            <p className="text-[#71717A] text-lg max-w-xl mx-auto">
              Have a question or want to book a vehicle? We&apos;re here to help — reach out any time.
            </p>
          </div>
        </section>

        <section className="py-16 px-6 border-t border-[#1F1F1F]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact Info */}
            <div>
              <h2 className="font-serif font-bold text-3xl text-white mb-8 tracking-tight">
                We&apos;d Love to Hear From You
              </h2>

              <div className="space-y-5 mb-10">
                {[
                  { icon: <Phone size={18} />, label: "Phone", value: "+44 7401 102238", href: "tel:+447000000000" },
                  { icon: <Mail size={18} />, label: "Email", value: "hello@dxkrentals.com", href: "mailto:hello@dxkrentals.com" },
                  { icon: <MapPin size={18} />, label: "Location", value: "United Kingdom", href: null },
                  { icon: <Clock size={18} />, label: "Hours", value: "Mon–Sun, 8am – 10pm", href: null },
                ].map(({ icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.2)] rounded-xl flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="text-[#71717A] text-xs uppercase tracking-wider mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-white font-semibold text-sm hover:text-[#D4AF37] transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-white font-semibold text-sm">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] px-6 py-4 rounded-2xl hover:bg-[#25D366]/20 transition-colors w-full"
              >
                <MessageCircle size={22} />
                <div>
                  <p className="font-bold text-sm">Chat on WhatsApp</p>
                  <p className="text-[#25D366]/70 text-xs">Fastest way to reach us</p>
                </div>
              </a>
            </div>

            {/* Contact Form */}
            <div className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="text-white font-bold text-xl mb-2">Message Sent!</h3>
                  <p className="text-[#71717A] text-sm leading-relaxed">
                    Thank you for reaching out. We&apos;ll get back to you within a few hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                    className="mt-6 text-[#D4AF37] text-sm hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-white font-serif font-bold text-xl mb-6">Send a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className={lc}>Your Name *</label>
                      <input
                        name="name" value={form.name} onChange={handleChange}
                        placeholder="James Whitmore" className={ic} required
                      />
                    </div>
                    <div>
                      <label className={lc}>Email Address *</label>
                      <input
                        name="email" type="email" value={form.email} onChange={handleChange}
                        placeholder="you@example.com" className={ic} required
                      />
                    </div>
                    <div>
                      <label className={lc}>Phone (optional)</label>
                      <input
                        name="phone" type="tel" value={form.phone} onChange={handleChange}
                        placeholder="+44 7000 000000" className={ic}
                      />
                    </div>
                    <div>
                      <label className={lc}>Message *</label>
                      <textarea
                        name="message" value={form.message} onChange={handleChange}
                        placeholder="Tell us about your rental requirements..."
                        rows={5} className={`${ic} resize-none`} required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-60 text-sm mt-2"
                    >
                      {sending ? "Sending..." : "Send Message"}
                    </button>
                    <p className="text-[#71717A] text-xs text-center">
                      Or message us directly on WhatsApp for a faster response
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

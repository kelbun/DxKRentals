"use client";
export default function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "447000000000";
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-7 right-7 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-green-900/40 z-50 text-2xl hover:scale-110 transition-transform"
      aria-label="Contact DxK Rentals on WhatsApp"
    >
      💬
    </a>
  );
}

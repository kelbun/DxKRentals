import { notFound } from "next/navigation";
import Image from "next/image";
import { getCarBySlug, getCars } from "@/services/cars";
import BookingForm from "@/components/forms/BookingForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { formatCurrency } from "@/lib/utils/format";
import { Users, Fuel, Settings2, Palette, Calendar } from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const cars = await getCars().catch(() => []);
  return cars.map((c) => ({ slug: c.slug }));
}

export default async function VehicleDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);
  if (!car) notFound();

  const primaryImage = car.car_images?.[0]?.image_url;

  const specs = [
    { icon: <Settings2 size={14} />, label: "Transmission", value: car.transmission },
    { icon: <Fuel size={14} />, label: "Fuel Type", value: car.fuel_type },
    { icon: <Users size={14} />, label: "Seats", value: car.seats ? `${car.seats} passengers` : null },
    { icon: <Palette size={14} />, label: "Colour", value: car.color },
    { icon: <Calendar size={14} />, label: "Year", value: car.year?.toString() },
  ].filter((s) => s.value);

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen pt-24">
        {/* Hero Image */}
        <div className="relative h-[50vh] md:h-[60vh] bg-surface overflow-hidden">
          {primaryImage ? (
            <Image src={primaryImage} alt={car.name} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted text-sm">No image available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-8 left-6 md:left-16">
            <p className="text-muted text-sm uppercase tracking-widest mb-1">
              {car.brand} · {car.year}
            </p>
            <h1 className="font-serif font-bold text-4xl md:text-6xl text-white tracking-tight">
              {car.model}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Pricing */}
            <div className="flex gap-6">
              <div className="bg-surface2 border border-[rgba(212,175,55,0.2)] rounded-2xl px-6 py-5 flex-1">
                <p className="text-muted text-xs uppercase tracking-widest mb-1">Daily Rate</p>
                <p className="text-gold font-serif font-extrabold text-3xl">
                  {formatCurrency(car.daily_price || 0)}
                </p>
              </div>
              {car.weekend_price && (
                <div className="bg-surface2 border border-[rgba(212,175,55,0.2)] rounded-2xl px-6 py-5 flex-1">
                  <p className="text-muted text-xs uppercase tracking-widest mb-1">Weekend Rate</p>
                  <p className="text-goldSoft font-serif font-extrabold text-3xl">
                    {formatCurrency(car.weekend_price)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {car.description && (
              <div>
                <h2 className="font-serif font-bold text-2xl text-white mb-4">About this Vehicle</h2>
                <p className="text-muted leading-relaxed">{car.description}</p>
              </div>
            )}

            {/* Specs */}
            <div>
              <h2 className="font-serif font-bold text-2xl text-white mb-6">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {specs.map(({ icon, label, value }) => (
                  <div key={label} className="bg-surface2 border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted mb-2">
                      {icon}
                      <span className="text-xs uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Gallery */}
            {car.car_images && car.car_images.length > 1 && (
              <div>
                <h2 className="font-serif font-bold text-2xl text-white mb-6">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.car_images.slice(1).map((img) => (
                    <div key={img.id} className="relative h-40 rounded-xl overflow-hidden bg-surface">
                      <Image src={img.image_url} alt={car.name} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface2 border border-[rgba(212,175,55,0.2)] rounded-2xl p-7">
              <h3 className="font-serif font-bold text-xl text-white mb-6">Reserve This Vehicle</h3>
              <BookingForm car={car} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

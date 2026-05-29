"use client";
import Link from "next/link";
import Image from "next/image";
import { Users, Zap, Settings2 } from "lucide-react";
import type { Car } from "@/types";
import { formatCurrency } from "@/lib/utils/format";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const primaryImage = car.car_images?.[0]?.image_url;

  return (
    <Link href={`/cars/${car.slug}`} className="group block">
      <div className="bg-surface2 border border-[rgba(212,175,55,0.18)] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(212,175,55,0.4)] hover:shadow-2xl hover:shadow-gold/10">
        {/* Image */}
        <div className="relative h-52 bg-surface overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={car.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface2 to-surface">
              <span className="text-muted text-sm">No image</span>
            </div>
          )}
          {car.featured && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-gold to-goldSoft text-black text-xs font-bold px-3 py-1 rounded-full">
              Featured
            </div>
          )}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-green-400 text-xs font-medium">Available</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-muted text-xs uppercase tracking-widest mb-1">
                {car.brand} · {car.year}
              </p>
              <h3 className="text-white font-serif font-bold text-lg leading-tight">
                {car.model}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-gold font-serif font-extrabold text-xl">
                {formatCurrency(car.daily_price || 0)}
              </p>
              <p className="text-muted text-xs">/day</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted border-t border-border pt-3">
            <span className="flex items-center gap-1">
              <Users size={12} /> {car.seats} seats
            </span>
            <span className="flex items-center gap-1">
              <Settings2 size={12} /> {car.transmission}
            </span>
            <span className="flex items-center gap-1">
              <Zap size={12} /> {car.fuel_type}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

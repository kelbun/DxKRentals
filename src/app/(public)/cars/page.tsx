"use client";
import { useState } from "react";
import { useCars } from "@/hooks/useCars";
import CarCard from "@/components/cards/CarCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

const BRANDS = ["All", "Mercedes"];
const TRANSMISSIONS = ["All", "Automatic", "Manual"];

export default function CarsPage() {
  const [brand, setBrand] = useState("");
  const [transmission, setTransmission] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sortDesc, setSortDesc] = useState(false);

  const { cars, loading } = useCars({
    brand: brand || undefined,
    transmission: transmission || undefined,
    maxPrice,
  });

  const sorted = [...cars].sort((a, b) =>
    sortDesc
      ? (b.daily_price || 0) - (a.daily_price || 0)
      : (a.daily_price || 0) - (b.daily_price || 0)
  );

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-gold text-xs tracking-[0.2em] uppercase mb-2">Our Collection</p>
            <h1 className="font-serif font-bold text-5xl text-white tracking-tight mb-2">
              Premium Fleet
            </h1>
            <p className="text-muted">{sorted.length} vehicles available</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {BRANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBrand(b === "All" ? "" : b)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                    (brand === "" && b === "All") || brand === b
                      ? "bg-gradient-to-r from-gold to-goldSoft text-black"
                      : "bg-surface2 text-muted border border-[rgba(212,175,55,0.15)] hover:border-gold/30"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <select
              value={sortDesc ? "desc" : "asc"}
              onChange={(e) => setSortDesc(e.target.value === "desc")}
              className="bg-surface2 text-white border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-2 text-sm focus:outline-none"
            >
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface2 border border-border rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted">No vehicles found for the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

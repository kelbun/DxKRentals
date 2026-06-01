"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import { X, Upload, Plus, Loader2 } from "lucide-react";

interface CarImage {
  id: string;
  image_url: string;
  sort_order: number;
}

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  daily_price: number;
  weekend_price: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  color: string;
  description: string;
  slug: string;
  featured: boolean;
  status: string;
  car_images: CarImage[];
}

const EMPTY_FORM = {
  name: "", slug: "", brand: "", model: "",
  year: new Date().getFullYear(),
  description: "", daily_price: "", weekend_price: "",
  transmission: "Automatic", fuel_type: "Petrol",
  seats: "4", color: "", featured: false, status: "available",
};

export default function FleetAdminPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCar, setEditCar] = useState<Car | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [blockModal, setBlockModal] = useState<{ carId: string; carName: string } | null>(null);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [blockError, setBlockError] = useState("");
  const [blockedDates, setBlockedDates] = useState<any[]>([]);

  const fetchBlockedDates = async (carId: string) => {
    const { data } = await supabase.from("blocked_dates").select("*").eq("car_id", carId).order("start_date");
    setBlockedDates(data || []);
  };

  const openBlockModal = async (carId: string, carName: string) => {
    setBlockModal({ carId, carName });
    setBlockStart(""); setBlockEnd(""); setBlockReason(""); setBlockError("");
    await fetchBlockedDates(carId);
  };

  const handleBlock = async () => {
    if (!blockModal || !blockStart || !blockEnd) {
      setBlockError("Please select start and end dates."); return;
    }
    if (blockEnd <= blockStart) {
      setBlockError("End date must be after start date."); return;
    }
    setBlocking(true);
    const { error } = await supabase.from("blocked_dates").insert({
      car_id: blockModal.carId, start_date: blockStart, end_date: blockEnd,
      reason: blockReason || null,
    });
    if (error) { setBlockError(error.message); setBlocking(false); return; }
    await fetchBlockedDates(blockModal.carId);
    setBlockStart(""); setBlockEnd(""); setBlockReason(""); setBlockError("");
    setBlocking(false);
  };

  const handleUnblock = async (id: string) => {
    await supabase.from("blocked_dates").delete().eq("id", id);
    if (blockModal) await fetchBlockedDates(blockModal.carId);
  };
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchCars = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("cars")
      .select("*, car_images(*)")
      .order("created_at", { ascending: false });
    setCars(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCars(); }, []);

  const openAdd = () => {
    setEditCar(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setImagePreviews([]);
    setError("");
    setShowModal(true);
  };

  const openEdit = (car: Car) => {
    setEditCar(car);
    setForm({
      name: car.name || "", slug: car.slug || "",
      brand: car.brand || "", model: car.model || "",
      year: car.year || new Date().getFullYear(),
      description: car.description || "",
      daily_price: car.daily_price || "",
      weekend_price: car.weekend_price || "",
      transmission: car.transmission || "Automatic",
      fuel_type: car.fuel_type || "Petrol",
      seats: car.seats || "4",
      color: car.color || "",
      featured: car.featured || false,
      status: car.status || "available",
    });
    setImages([]);
    setImagePreviews([]);
    setError("");
    setShowModal(true);
  };

  const handleField = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (name === "name") {
      setForm((f: any) => ({
        ...f,
        name: value,
        slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }));
    } else {
      setForm((f: any) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removePreview = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const uploadImages = async (carId: string) => {
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const ext = file.name.split(".").pop();
      const path = `${carId}/${Date.now()}-${i}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("car-images")
        .upload(path, file, { upsert: true });
      if (uploadErr) continue;
      const { data: urlData } = supabase.storage
        .from("car-images")
        .getPublicUrl(path);
      await supabase.from("car_images").insert({
        car_id: carId,
        image_url: urlData.publicUrl,
        sort_order: i,
      });
    }
  };

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.slug || !form.daily_price) {
      setError("Name, slug and daily price are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name, slug: form.slug, brand: form.brand,
        model: form.model, year: Number(form.year),
        description: form.description,
        daily_price: Number(form.daily_price),
        weekend_price: Number(form.weekend_price) || null,
        transmission: form.transmission, fuel_type: form.fuel_type,
        seats: Number(form.seats), color: form.color,
        featured: form.featured, status: form.status,
      };
      if (editCar) {
        const { error: updateErr } = await supabase
          .from("cars").update(payload).eq("id", editCar.id);
        if (updateErr) throw updateErr;
        if (images.length > 0) await uploadImages(editCar.id);
      } else {
        const { data: newCar, error: insertErr } = await supabase
          .from("cars").insert(payload).select().single();
        if (insertErr) throw insertErr;
        if (images.length > 0) await uploadImages(newCar.id);
      }
      await fetchCars();
      setShowModal(false);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Check the slug is unique.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (carId: string) => {
    await supabase.from("car_images").delete().eq("car_id", carId);
    await supabase.from("cars").delete().eq("id", carId);
    setDeleteConfirm(null);
    fetchCars();
  };

  const handleDeleteImage = async (imgId: string) => {
    await supabase.from("car_images").delete().eq("id", imgId);
    if (editCar) {
      setEditCar((prev: Car | null) =>
        prev ? { ...prev, car_images: prev.car_images.filter((i) => i.id !== imgId) } : prev
      );
    }
    fetchCars();
  };

  const ic = "w-full bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors";
  const lc = "block text-xs text-[#71717A] uppercase tracking-wider mb-1.5 font-medium";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif font-bold text-3xl text-white">Fleet Management</h1>
          <p className="text-[#71717A] text-sm mt-1">{cars.length} vehicles registered</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black font-bold text-sm px-6 py-2.5 rounded-full hover:opacity-90 flex items-center gap-2"
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-[#161616] border border-[#1F1F1F] rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#1F1F1F] rounded-2xl">
          <p className="text-[#71717A] mb-4">No vehicles yet</p>
          <button onClick={openAdd} className="text-[#D4AF37] text-sm hover:underline">
            Add your first vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => {
            const img = car.car_images?.[0]?.image_url;
            return (
              <div key={car.id} className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl overflow-hidden">
                <div className="relative h-44 bg-[#101010]">
                  {img ? (
                    <Image src={img} alt={car.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[#71717A] text-xs">No image</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      car.status === "available"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>{car.status}</span>
                  </div>
                  {car.car_images?.length > 0 && (
                    <div className="absolute bottom-2 left-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      {car.car_images.length} photo{car.car_images.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[#71717A] text-xs uppercase tracking-wider">{car.brand}</p>
                      <h3 className="text-white font-serif font-bold text-base">{car.model}</h3>
                    </div>
                    <p className="text-[#D4AF37] font-bold">
                      {formatCurrency(car.daily_price || 0)}
                      <span className="text-[#71717A] text-xs font-normal">/day</span>
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(car)}
                      className="flex-1 bg-[#101010] text-[#71717A] border border-[#1F1F1F] text-xs py-2 rounded-lg hover:text-white transition-colors"
                    >Edit</button>
                    <button
                      onClick={() => setDeleteConfirm(car.id)}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-white font-bold text-lg mb-3">Delete Vehicle?</h3>
            <p className="text-[#71717A] text-sm mb-6">
              This will permanently delete this car and all its photos.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2.5 bg-[#101010] text-[#71717A] border border-[#1F1F1F] rounded-full text-sm"
              >Cancel</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-6 py-2.5 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[rgba(212,175,55,0.2)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[#1F1F1F] sticky top-0 bg-[#111] z-10">
              <h2 className="text-white font-serif font-bold text-xl">
                {editCar ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#71717A] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className={lc}>Photos</label>
                {editCar && editCar.car_images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editCar.car_images.map((img) => (
                      <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#1F1F1F] group">
                        <Image src={img.image_url} alt="car" fill className="object-cover" />
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X size={16} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[rgba(212,175,55,0.3)] group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePreview(i)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X size={16} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => fileRef.current && fileRef.current.click()}
                  className="w-full border-2 border-dashed border-[rgba(212,175,55,0.25)] rounded-xl py-6 flex flex-col items-center gap-2 hover:border-[rgba(212,175,55,0.5)] transition-colors cursor-pointer"
                >
                  <Upload size={20} className="text-[#D4AF37]" />
                  <span className="text-[#71717A] text-sm">Click to upload photos</span>
                  <span className="text-[#71717A] text-xs">JPG, PNG — multiple allowed</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImages}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Vehicle Name *</label>
                  <input name="name" value={form.name} onChange={handleField}
                    placeholder="e.g. Lamborghini Urus" className={ic} />
                </div>
                <div>
                  <label className={lc}>Slug (auto-filled)</label>
                  <input name="slug" value={form.slug} onChange={handleField}
                    placeholder="lamborghini-urus" className={ic} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Brand</label>
                  <input name="brand" value={form.brand} onChange={handleField}
                    placeholder="e.g. Lamborghini" className={ic} />
                </div>
                <div>
                  <label className={lc}>Model</label>
                  <input name="model" value={form.model} onChange={handleField}
                    placeholder="e.g. Urus" className={ic} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={lc}>Year</label>
                  <input name="year" type="number" value={form.year}
                    onChange={handleField} className={ic} />
                </div>
                <div>
                  <label className={lc}>Daily Price £ *</label>
                  <input name="daily_price" type="number" value={form.daily_price}
                    onChange={handleField} placeholder="950" className={ic} />
                </div>
                <div>
                  <label className={lc}>Weekend Price £</label>
                  <input name="weekend_price" type="number" value={form.weekend_price}
                    onChange={handleField} placeholder="1200" className={ic} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={lc}>Transmission</label>
                  <select name="transmission" value={form.transmission}
                    onChange={handleField} className={ic}>
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
                <div>
                  <label className={lc}>Fuel Type</label>
                  <select name="fuel_type" value={form.fuel_type}
                    onChange={handleField} className={ic}>
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                  </select>
                </div>
                <div>
                  <label className={lc}>Seats</label>
                  <input name="seats" type="number" value={form.seats}
                    onChange={handleField} placeholder="4" className={ic} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Colour</label>
                  <input name="color" value={form.color} onChange={handleField}
                    placeholder="e.g. Midnight Black" className={ic} />
                </div>
                <div>
                  <label className={lc}>Status</label>
                  <select name="status" value={form.status}
                    onChange={handleField} className={ic}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={lc}>Description</label>
                <textarea name="description" value={form.description}
                  onChange={handleField} rows={3}
                  placeholder="Describe this vehicle..."
                  className={`${ic} resize-none`} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="featured" checked={form.featured}
                  onChange={handleField} className="w-4 h-4 accent-[#D4AF37]" />
                <span className="text-white text-sm">Feature on homepage</span>
              </label>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-[#101010] text-[#71717A] border border-[#1F1F1F] rounded-full text-sm hover:text-white transition-colors"
                >Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black font-bold rounded-full text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    : editCar ? "Save Changes" : "Add Vehicle"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
      {/* Block Dates Modal */}
      {blockModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[rgba(212,175,55,0.2)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[#1F1F1F] sticky top-0 bg-[#111] z-10">
              <div>
                <h2 className="text-white font-serif font-bold text-lg">Block Dates</h2>
                <p className="text-[#71717A] text-xs mt-0.5">{blockModal.carName}</p>
              </div>
              <button onClick={() => setBlockModal(null)} className="text-[#71717A] hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[#71717A] text-xs leading-relaxed">
                Block dates to prevent customers from booking this vehicle during specific periods — e.g. maintenance, personal use, or holidays.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#71717A] uppercase tracking-wider block mb-1.5">Start Date</label>
                  <input type="date" value={blockStart} onChange={e => setBlockStart(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60" />
                </div>
                <div>
                  <label className="text-xs text-[#71717A] uppercase tracking-wider block mb-1.5">End Date</label>
                  <input type="date" value={blockEnd} onChange={e => setBlockEnd(e.target.value)}
                    min={blockStart || new Date().toISOString().split("T")[0]}
                    className="w-full bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#71717A] uppercase tracking-wider block mb-1.5">Reason (optional)</label>
                <input type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)}
                  placeholder="e.g. Maintenance, Personal use..."
                  className="w-full bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60" />
              </div>
              {blockError && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs">{blockError}</div>}
              <button onClick={handleBlock} disabled={blocking}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black font-bold py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-60">
                {blocking ? "Blocking..." : "Block These Dates"}
              </button>

              {/* Existing blocks */}
              {blockedDates.length > 0 && (
                <div className="pt-2 border-t border-[#1F1F1F]">
                  <p className="text-[#71717A] text-xs uppercase tracking-wider mb-3">Currently Blocked</p>
                  <div className="space-y-2">
                    {blockedDates.map((b) => (
                      <div key={b.id} className="flex items-center justify-between bg-[#101010] border border-[#1F1F1F] rounded-xl px-4 py-3">
                        <div>
                          <p className="text-white text-xs font-semibold">{b.start_date} → {b.end_date}</p>
                          {b.reason && <p className="text-[#71717A] text-xs mt-0.5">{b.reason}</p>}
                        </div>
                        <button onClick={() => handleUnblock(b.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-semibold ml-4 bg-red-500/10 px-3 py-1 rounded-lg hover:bg-red-500/20 transition-colors">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

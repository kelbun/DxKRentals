"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface Document {
  id: string;
  document_url: string;
  document_type: string;
  approved: boolean;
  uploaded_at: string;
  user: { full_name: string; email: string; phone: string };
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Document | null>(null);
  const supabase = createClient();

  const fetchDocs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("driver_documents")
      .select("*, user:users(full_name, email, phone)")
      .order("uploaded_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const toggleApproved = async (id: string, current: boolean) => {
    await supabase.from("driver_documents").update({ approved: !current }).eq("id", id);
    fetchDocs();
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, approved: !current } : null);
  };

  const formatType = (t: string) =>
    t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const grouped: Record<string, Document[]> = {};
  docs.forEach((d) => {
    const key = d.user?.email || "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-white">Driver Documents</h1>
        <p className="text-[#71717A] text-sm mt-1">{docs.length} document{docs.length !== 1 ? "s" : ""} uploaded</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <div key={i} className="h-24 bg-[#161616] rounded-2xl animate-pulse" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#1F1F1F] rounded-2xl">
          <p className="text-[#71717A]">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Object.entries(grouped).map(([email, userDocs]) => {
              const user = userDocs[0].user;
              return (
                <div key={email} className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-5">
                  <div className="mb-4">
                    <p className="text-white font-semibold text-sm">{user?.full_name}</p>
                    <p className="text-[#71717A] text-xs">{user?.email}</p>
                    {user?.phone && <p className="text-[#71717A] text-xs">{user?.phone}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {userDocs.map((doc) => (
                      <div key={doc.id} onClick={() => setSelected(doc)}
                        className={`relative cursor-pointer rounded-xl overflow-hidden border transition-all ${
                          selected?.id === doc.id ? "border-[#D4AF37]/60" : "border-[#1F1F1F] hover:border-[#2F2F2F]"
                        }`}>
                        {/* Use regular img tag to avoid Next.js domain issues */}
                        <div className="h-28 bg-[#101010] overflow-hidden">
                          <img
                            src={doc.document_url}
                            alt={doc.document_type}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement;
                              t.style.display = "none";
                              const parent = t.parentElement;
                              if (parent) parent.innerHTML = `<div class="w-full h-full flex items-center justify-center"><span style="color:#71717A;font-size:12px;">Image unavailable</span></div>`;
                            }}
                          />
                        </div>
                        <div className="p-2 flex items-center justify-between">
                          <span className="text-[#71717A] text-xs">{formatType(doc.document_type)}</span>
                          {doc.approved ? (
                            <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                              <CheckCircle size={11} /> Approved
                            </span>
                          ) : (
                            <span className="text-yellow-500 text-xs font-semibold">Pending</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
            {selected ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white font-bold text-base">{formatType(selected.document_type)}</h3>
                  <button onClick={() => setSelected(null)} className="text-[#71717A] hover:text-white text-xs">Close</button>
                </div>
                <div className="h-48 bg-[#101010] rounded-xl overflow-hidden mb-4 border border-[#1F1F1F]">
                  <img
                    src={selected.document_url}
                    alt={selected.document_type}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = "none";
                    }}
                  />
                </div>
                <div className="space-y-3 mb-5">
                  <div className="bg-[#101010] rounded-xl p-3">
                    <p className="text-[#71717A] text-xs mb-1">Customer</p>
                    <p className="text-white text-sm font-semibold">{selected.user?.full_name}</p>
                    <p className="text-[#71717A] text-xs">{selected.user?.email}</p>
                  </div>
                  <div className="flex items-center justify-between bg-[#101010] rounded-xl p-3">
                    <span className="text-[#71717A] text-xs">Status</span>
                    <span className={`text-xs font-bold ${selected.approved ? "text-green-400" : "text-yellow-500"}`}>
                      {selected.approved ? "✓ Approved" : "Pending Review"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <button onClick={() => toggleApproved(selected.id, selected.approved)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      selected.approved
                        ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                        : "bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20"
                    }`}>
                    {selected.approved ? <><XCircle size={14} /> Revoke Approval</> : <><CheckCircle size={14} /> Approve Document</>}
                  </button>
                  <a href={selected.document_url} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#101010] text-[#71717A] border border-[#1F1F1F] hover:text-white transition-colors">
                    <ExternalLink size={14} /> Open Full Size
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#71717A] text-sm">Click a document to review and approve it</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

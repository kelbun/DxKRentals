"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, ExternalLink, Loader2, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

interface Document {
  id: string;
  document_url: string;
  document_type: string;
  approved: boolean;
  rejected: boolean;
  rejection_reason: string | null;
  uploaded_at: string;
  user: { full_name: string; email: string; phone: string };
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Document | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const supabase = createClient();

  const fetchDocs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("driver_documents")
      .select("*, user:users(full_name, email, phone)")
      .order("uploaded_at", { ascending: false });
    setDocs((data || []).filter((d: Document) => d.document_url !== "CANNOT_PROVIDE"));
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const getSignedUrl = async (doc: Document): Promise<string | null> => {
    if (signedUrls[doc.id]) return signedUrls[doc.id];
    setLoadingUrl(true);
    try {
      const url = doc.document_url;
      const bucketMarker = "/driver-documents/";
      const pathStart = url.indexOf(bucketMarker);
      if (pathStart === -1) { setLoadingUrl(false); return url; }
      const filePath = decodeURIComponent(url.substring(pathStart + bucketMarker.length).split("?")[0]);
      const { data, error } = await supabase.storage.from("driver-documents").createSignedUrl(filePath, 3600);
      if (error || !data?.signedUrl) { setLoadingUrl(false); return null; }
      setSignedUrls((prev) => ({ ...prev, [doc.id]: data.signedUrl }));
      setLoadingUrl(false);
      return data.signedUrl;
    } catch { setLoadingUrl(false); return null; }
  };

  const handleSelectDoc = async (doc: Document) => {
    setSelected(selected?.id === doc.id ? null : doc);
    setShowRejectModal(false);
    setShowDeleteConfirm(false);
    setRejectReason("");
    await getSignedUrl(doc);
  };

  const approveDoc = async () => {
    if (!selected) return;
    setProcessing(true);
    await supabase.from("driver_documents")
      .update({ approved: true, rejected: false, rejection_reason: null })
      .eq("id", selected.id);
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "document_approved",
        customerEmail: selected.user?.email,
        customerName: selected.user?.full_name,
        documentType: selected.document_type,
      }),
    });
    await fetchDocs();
    setSelected((prev) => prev ? { ...prev, approved: true, rejected: false, rejection_reason: null } : null);
    setProcessing(false);
  };

  const rejectDoc = async () => {
    if (!selected || !rejectReason.trim()) return;
    setProcessing(true);
    await supabase.from("driver_documents")
      .update({ approved: false, rejected: true, rejection_reason: rejectReason })
      .eq("id", selected.id);
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "document_rejected",
        customerEmail: selected.user?.email,
        customerName: selected.user?.full_name,
        documentType: selected.document_type,
        rejectionReason: rejectReason,
      }),
    });
    await fetchDocs();
    setSelected((prev) => prev ? { ...prev, approved: false, rejected: true, rejection_reason: rejectReason } : null);
    setShowRejectModal(false);
    setRejectReason("");
    setProcessing(false);
  };

  const revokeApproval = async () => {
    if (!selected) return;
    setProcessing(true);
    await supabase.from("driver_documents")
      .update({ approved: false, rejected: false, rejection_reason: null })
      .eq("id", selected.id);
    await fetchDocs();
    setSelected((prev) => prev ? { ...prev, approved: false } : null);
    setProcessing(false);
  };

  const deleteDoc = async () => {
    if (!selected) return;
    setProcessing(true);
    try {
      // Try to delete from storage too
      const url = selected.document_url;
      const bucketMarker = "/driver-documents/";
      const pathStart = url.indexOf(bucketMarker);
      if (pathStart !== -1) {
        const filePath = decodeURIComponent(url.substring(pathStart + bucketMarker.length).split("?")[0]);
        await supabase.storage.from("driver-documents").remove([filePath]);
      }
    } catch (e) { console.error("Storage delete error:", e); }
    // Delete from database
    await supabase.from("driver_documents").delete().eq("id", selected.id);
    await fetchDocs();
    setSelected(null);
    setShowDeleteConfirm(false);
    setProcessing(false);
  };

  const formatType = (t: string) => t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const grouped: Record<string, Document[]> = {};
  docs.forEach((d) => {
    const key = d.user?.email || "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  const getStatusBadge = (doc: Document) => {
    if (doc.approved) return <span className="flex items-center gap-1 text-green-400 text-xs font-semibold"><CheckCircle size={10} /> Approved</span>;
    if (doc.rejected) return <span className="flex items-center gap-1 text-red-400 text-xs font-semibold"><XCircle size={10} /> Rejected</span>;
    return <span className="text-yellow-500 text-xs font-semibold">Pending</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-white">Driver Documents</h1>
        <p className="text-[#71717A] text-sm mt-1">
          {docs.length} document{docs.length !== 1 ? "s" : ""} uploaded
          <span className="ml-2 text-xs bg-[#161616] border border-[#1F1F1F] px-2 py-0.5 rounded-full">🔒 Private secure access</span>
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-[#161616] rounded-2xl animate-pulse" />)}</div>
      ) : docs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#1F1F1F] rounded-2xl">
          <p className="text-[#71717A]">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {Object.entries(grouped).map(([email, userDocs]) => {
              const user = userDocs[0].user;
              const hasRejected = userDocs.some(d => d.rejected);
              return (
                <div key={email} className={`bg-[#161616] border rounded-2xl p-5 ${hasRejected ? "border-red-500/30" : "border-[rgba(212,175,55,0.15)]"}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white font-semibold text-sm">{user?.full_name}</p>
                      <p className="text-[#71717A] text-xs">{user?.email}</p>
                      {user?.phone && <p className="text-[#71717A] text-xs">{user?.phone}</p>}
                    </div>
                    {hasRejected && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1">
                        <p className="text-red-400 text-xs font-semibold">Awaiting resubmission</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {userDocs.map((doc) => (
                      <div key={doc.id} onClick={() => handleSelectDoc(doc)}
                        className={`relative cursor-pointer rounded-xl overflow-hidden border transition-all ${
                          selected?.id === doc.id ? "border-[#D4AF37]/60" :
                          doc.rejected ? "border-red-500/40" :
                          doc.approved ? "border-green-500/30" :
                          "border-[#1F1F1F] hover:border-[#2F2F2F]"
                        }`}>
                        <div className="h-28 bg-[#101010] overflow-hidden flex items-center justify-center">
                          {signedUrls[doc.id] ? (
                            <img src={signedUrls[doc.id]} alt={doc.document_type} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-lg">🔒</span>
                              <span className="text-[#71717A] text-xs">Click to load</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2 flex items-center justify-between bg-[#101010]">
                          <span className="text-[#71717A] text-xs truncate">{formatType(doc.document_type)}</span>
                          {getStatusBadge(doc)}
                        </div>
                        {doc.rejection_reason && (
                          <div className="bg-red-500/10 px-2 py-1 border-t border-red-500/20">
                            <p className="text-red-400 text-xs truncate">Reason: {doc.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
            {selected ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white font-bold text-base">{formatType(selected.document_type)}</h3>
                  <button onClick={() => { setSelected(null); setShowRejectModal(false); setShowDeleteConfirm(false); }}
                    className="text-[#71717A] hover:text-white text-xs">Close</button>
                </div>

                {/* Image */}
                <div className="h-44 bg-[#101010] rounded-xl overflow-hidden mb-4 border border-[#1F1F1F] flex items-center justify-center">
                  {loadingUrl ? (
                    <Loader2 size={20} className="text-[#71717A] animate-spin" />
                  ) : signedUrls[selected.id] ? (
                    <img src={signedUrls[selected.id]} alt={selected.document_type} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center"><div className="text-2xl mb-2">🔒</div><p className="text-[#71717A] text-xs">Loading...</p></div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="bg-[#101010] rounded-xl p-3">
                    <p className="text-[#71717A] text-xs mb-1">Customer</p>
                    <p className="text-white text-sm font-semibold">{selected.user?.full_name}</p>
                    <p className="text-[#71717A] text-xs">{selected.user?.email}</p>
                  </div>
                  <div className="flex items-center justify-between bg-[#101010] rounded-xl p-3">
                    <span className="text-[#71717A] text-xs">Status</span>
                    {getStatusBadge(selected)}
                  </div>
                  {selected.rejection_reason && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                      <p className="text-red-400 text-xs font-semibold mb-1">Rejection Reason</p>
                      <p className="text-red-300 text-xs">{selected.rejection_reason}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!showRejectModal && !showDeleteConfirm && (
                  <div className="space-y-2">
                    {!selected.approved && (
                      <button onClick={approveDoc} disabled={processing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 disabled:opacity-50">
                        {processing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />} Approve
                      </button>
                    )}
                    {selected.approved && (
                      <button onClick={revokeApproval} disabled={processing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#101010] text-[#71717A] border border-[#1F1F1F] hover:text-white disabled:opacity-50">
                        <RefreshCw size={13} /> Revoke Approval
                      </button>
                    )}
                    <button onClick={() => setShowRejectModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                      <XCircle size={13} /> Reject & Request Resubmission
                    </button>
                    {signedUrls[selected.id] && (
                      <a href={signedUrls[selected.id]} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm bg-[#101010] text-[#71717A] border border-[#1F1F1F] hover:text-white">
                        <ExternalLink size={13} /> Open Full Size
                      </a>
                    )}
                    <button onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-red-900/20 text-red-500 border border-red-900/40 hover:bg-red-900/30">
                      <Trash2 size={13} /> Delete Document
                    </button>
                  </div>
                )}

                {/* Reject form */}
                {showRejectModal && (
                  <div className="bg-red-500/8 border border-red-500/25 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-400" />
                      <p className="text-red-400 font-semibold text-sm">Reject Document</p>
                    </div>
                    <p className="text-[#71717A] text-xs">Customer will receive an email with your reason and be asked to resubmit.</p>
                    <div>
                      <label className="text-xs text-[#71717A] uppercase tracking-wider block mb-1.5">Reason *</label>
                      <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
                        placeholder="e.g. Image is blurry, please upload a clearer photo..."
                        className="w-full bg-[#0D0D0D] border border-red-500/30 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500/60 resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                        className="flex-1 bg-[#101010] text-[#71717A] border border-[#1F1F1F] py-2.5 rounded-xl text-sm">Cancel</button>
                      <button onClick={rejectDoc} disabled={!rejectReason.trim() || processing}
                        className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-500/30 disabled:opacity-50 flex items-center justify-center gap-1">
                        {processing ? <Loader2 size={12} className="animate-spin" /> : null} Reject & Notify
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete confirm */}
                {showDeleteConfirm && (
                  <div className="bg-red-900/15 border border-red-900/40 rounded-xl p-4 space-y-3">
                    <p className="text-red-500 font-semibold text-sm">Delete this document?</p>
                    <p className="text-[#71717A] text-xs">This will permanently delete the document and remove it from storage. Cannot be undone.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 bg-[#101010] text-[#71717A] border border-[#1F1F1F] py-2.5 rounded-xl text-sm">Cancel</button>
                      <button onClick={deleteDoc} disabled={processing}
                        className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1">
                        {processing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-3xl mb-3">🔒</div>
                <p className="text-[#71717A] text-sm">Click a document to view and manage it</p>
                <p className="text-[#71717A] text-xs mt-2 opacity-60">Images loaded with temporary secure links</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

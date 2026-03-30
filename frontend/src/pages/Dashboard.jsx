import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import DocumentCard from "../components/Documentcard";
import ShareModal from "../components/ShareModal";
import { createDoc, createShareLink, deleteDoc, getDocs } from "../services/docservice";

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [copiedRole, setCopiedRole] = useState("");
  const [shareModalDoc, setShareModalDoc] = useState(null);
  const [shareLinks, setShareLinks] = useState({ viewer: "", editor: "" });

  const fetchDocs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getDocs();
      setDocs(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Could not load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleCreateDoc = async () => {
    const res = await createDoc();
    window.location.href = `/doc/${res.data._id}`;
  };

  const handleDeleteDoc = async (id) => {
    await deleteDoc(id);
    setDocs((current) => current.filter((doc) => doc._id !== id));
  };

  const showToast = (message, role = "") => {
    setShareMessage(message);
    setCopiedRole(role);
    window.setTimeout(() => {
      setShareMessage("");
      setCopiedRole("");
    }, 2200);
  };

  const handleOpenShare = async (doc) => {
    try {
      const [viewerRes, editorRes] = await Promise.all([
        createShareLink(doc._id, "viewer"),
        createShareLink(doc._id, "editor"),
      ]);

      setShareLinks({
        viewer: `${window.location.origin}/doc/${doc._id}?share=${viewerRes.data.shareToken}`,
        editor: `${window.location.origin}/doc/${doc._id}?share=${editorRes.data.shareToken}`,
      });
      setShareModalDoc(doc);
    } catch (err) {
      showToast(err.response?.data?.msg || "Could not create share links");
    }
  };

  const handleCopyShareLink = async (role) => {
    try {
      await navigator.clipboard.writeText(shareLinks[role]);
      showToast(
        role === "viewer"
          ? "Viewer link copied. Another logged-in user can open this link in read-only mode."
          : "Editor link copied. Another logged-in user can open this link and edit the document.",
        role
      );
    } catch (err) {
      showToast(err.response?.data?.msg || "Could not copy share link");
    }
  };

  const filteredDocs = docs.filter((doc) =>
    `${doc.title || ""} ${doc.content || ""}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-8 flex flex-col gap-6 rounded-3xl bg-slate-900 px-6 py-8 text-white md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Dashboard</p>
            <h2 className="mt-3 text-3xl font-bold">Your collaborative documents</h2>
            <p className="mt-2 text-slate-300">
              Create, open, and continue editing documents from one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:min-w-80">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Total docs</p>
              <p className="mt-2 text-3xl font-bold">{docs.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">Active results</p>
              <p className="mt-2 text-3xl font-bold">{filteredDocs.length}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9 3a6 6 0 104.472 10.002l3.763 3.763a1 1 0 001.414-1.414l-3.763-3.763A6 6 0 009 3zm-4 6a4 4 0 118 0 4 4 0 01-8 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents by title..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            onClick={handleCreateDoc}
            className="rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-200 transition duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-300"
          >
            + New Document
          </button>
        </div>

        {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}
        {shareMessage ? (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition">
            <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            {shareMessage}
          </div>
        ) : null}
        {loading ? <p className="text-slate-500">Loading documents...</p> : null}

        {!loading && filteredDocs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            {docs.length === 0
              ? "No documents yet. Create your first document to get started."
              : "No documents match your search right now."}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              onOpen={() => (window.location.href = `/doc/${doc._id}`)}
              onShare={handleOpenShare}
              onDelete={() => handleDeleteDoc(doc._id)}
            />
          ))}
        </div>
      </div>

      <ShareModal
        isOpen={Boolean(shareModalDoc)}
        onClose={() => setShareModalDoc(null)}
        title={shareModalDoc ? `Share "${shareModalDoc.title || "Untitled Document"}"` : "Share Document"}
        viewerLink={shareLinks.viewer}
        editorLink={shareLinks.editor}
        onCopy={handleCopyShareLink}
        copiedRole={copiedRole}
      />
    </div>
  );
}

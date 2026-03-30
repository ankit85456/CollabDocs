export default function DocumentCard({ doc, onOpen, onDelete, onShare }) {
  const preview =
    doc.content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    "Start writing your notes, ideas, and shared content here.";

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-slate-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl shadow-inner">
            <span aria-hidden="true">📄</span>
          </div>

          <div className="min-w-0">
          <h2 className="font-semibold text-slate-900">{doc.title || "Untitled Document"}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Last edited{" "}
            <span className="font-semibold text-slate-700">
              {doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "Recently"}
            </span>
          </p>
        </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          Live
        </span>
      </div>

      <p className="mb-5 min-h-16 text-sm leading-6 text-slate-600">{preview}</p>

      <div className="mb-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Owner workspace
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
          Editor access
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onOpen}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Open
        </button>
        <button
          onClick={() => onShare(doc)}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Share
        </button>
        <button
          onClick={onDelete}
          className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

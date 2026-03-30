import { useEffect, useState } from "react";

export default function ShareModal({
  isOpen,
  onClose,
  title = "Share Document",
  viewerLink = "",
  editorLink = "",
  onCopy,
  copiedRole = "",
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }

    const timeout = setTimeout(() => setMounted(false), 180);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!mounted) return null;

  const shareItems = [
    {
      role: "viewer",
      icon: "👁",
      label: "Viewer Link",
      description: "Anyone with this link can open the document in read-only mode.",
      value: viewerLink,
    },
    {
      role: "editor",
      icon: "✏",
      label: "Editor Link",
      description: "Anyone with this link can edit and collaborate in real time.",
      value: editorLink,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-6 shadow-2xl shadow-slate-900/20 transition duration-200 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500">Share</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">
              Choose the access level you want to share and copy the ready-to-use link.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {shareItems.map((item) => (
            <div
              key={item.role}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
                      {item.icon}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.label}</h4>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <p className="truncate">{item.value || "Generate this link to share access."}</p>
                  </div>
                </div>

                <button
                  onClick={() => onCopy(item.role)}
                  className={`min-w-28 rounded-xl px-4 py-3 text-sm font-medium text-white transition ${
                    copiedRole === item.role
                      ? "scale-105 bg-emerald-500 shadow-lg shadow-emerald-200"
                      : "bg-slate-900 hover:scale-[1.02] hover:bg-slate-800"
                  }`}
                >
                  {copiedRole === item.role ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

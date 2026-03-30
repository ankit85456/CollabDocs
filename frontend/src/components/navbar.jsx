export default function Navbar() {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Workspace
        </p>
        <h1 className="text-2xl font-bold text-slate-900">CollabDocs</h1>
      </div>
      <button
        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white"
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}

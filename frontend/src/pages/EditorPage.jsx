import { useParams, useSearchParams } from "react-router-dom";
import Editor from "../components/Editor";
import Navbar from "../components/navbar";

export default function EditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const shareToken = searchParams.get("share") || "";

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Document Editor
            </p>
            <h2 className="mt-2 text-2xl font-bold">Real-time collaboration workspace</h2>
          </div>
          <button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur"
          >
            Back to Dashboard
          </button>
        </div>
        <Editor docId={id} shareToken={shareToken} />
      </div>
    </div>
  );
}

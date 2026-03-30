import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError("");
      await API.post("/auth/signup", form);
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-100 p-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl shadow-slate-200">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-500">CollabDocs</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-900">Create your account</h2>
        <p className="mt-2 text-sm text-slate-500">Start managing and collaborating on documents.</p>

        <div className="mt-8 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
            placeholder="Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 p-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Signup"}
          </button>

          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/" className="font-medium text-blue-600">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

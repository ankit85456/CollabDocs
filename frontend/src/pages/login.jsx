import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200">
        <div className="grid md:grid-cols-2">
          <div className="hidden bg-slate-900 p-10 text-white md:block">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">CollabDocs</p>
            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Write, edit and collaborate on documents in real time.
            </h1>
            <p className="mt-4 text-base text-slate-300">
              Login to open your workspace, manage documents, and continue editing where you left off.
            </p>
          </div>

          <div className="p-8 md:p-10">
            <h2 className="text-3xl font-semibold text-slate-900">Login</h2>
            <p className="mt-2 text-sm text-slate-500">Welcome back to your document workspace.</p>

            <div className="mt-8 space-y-4">
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                type="password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-sm text-slate-500">
                New here?{" "}
                <Link to="/signup" className="font-medium text-blue-600">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

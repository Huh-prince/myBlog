import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { formatApiErrorDetail } from "../lib/api";
import Seo from "../components/Seo";
import { LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Sign in — Learning Journey" />
      <section className="max-w-md mx-auto px-4 py-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#F38020] mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to site
        </Link>
        <div className="bg-[var(--bg-2)] border border-[var(--border-1)] rounded p-7 ">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded bg-[#F38020] text-white flex items-center justify-center"><LogIn className="w-4 h-4" /></div>
            <div className="text-xl font-bold text-slate-100">Admin sign in</div>
          </div>
          <p className="text-sm text-slate-400 mb-6">Single-author blog — only the admin can publish.</p>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email</label>
              <input
                data-testid="login-email-input"
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[var(--border-1)] bg-[var(--bg-1)] text-sm text-slate-100 focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]"
                placeholder="admin@learning.dev"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
              <input
                data-testid="login-password-input"
                type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[var(--border-1)] bg-[var(--bg-1)] text-sm text-slate-100 focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]"
              />
            </div>

            {error && <div data-testid="login-error" className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 px-3 py-2 rounded">{error}</div>}

            <button data-testid="login-submit-btn" disabled={busy} type="submit" className="w-full bg-[#F38020] text-white font-semibold py-2.5 rounded hover:bg-[#FF9E45] transition-colors disabled:opacity-60">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
